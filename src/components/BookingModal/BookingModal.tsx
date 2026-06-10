import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ActionIcon,
  Alert,
  Button,
  Checkbox,
  Group,
  Modal,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconLock,
  IconMessageCircle,
  IconMinus,
  IconMoodKid,
  IconPlus,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { BOOKING_LIMITS, PHONE_REGEX } from "@/constants/booking";
import { V2Button } from "@/modern/components/V2Button";
import { useReducedMotion } from "@/modern/hooks/useReducedMotion";
import type { River } from "@/types/river";
import type { Splav } from "@/types/splav";
import { formatDateRangeFull } from "@/utils/format";
import { formatPhone, normalizePhone } from "@/utils/phone";
import { submitBooking } from "@/utils/sheetsApi";
import classicStyles from "./BookingModal.module.css";
import modernStyles from "./BookingModal.modern.module.css";

interface BookingModalProps {
  river: River;
  dates: Splav[];
  preselectedDateId?: string | null;
  opened: boolean;
  onClose: () => void;
  variant?: "classic" | "modern";
}

const schema = z
  .object({
    scheduleId: z.string().min(1, "Выберите дату сплава"),
    name: z
      .string()
      .trim()
      .min(2, "Слишком короткое")
      .max(120, "Слишком длинное"),
    phone: z.string().trim().regex(PHONE_REGEX, "Формат: +375 (XX) XXX-XX-XX"),
    peopleCount: z
      .number({ invalid_type_error: "Укажите количество участников" })
      .int("Только целое число")
      .min(BOOKING_LIMITS.minPeople, "Минимум 1 человек")
      .max(BOOKING_LIMITS.maxPeople, "Максимум 20 человек"),
    hasKids: z.boolean(),
    kidsCount: z
      .number({ invalid_type_error: "Укажите количество детей" })
      .int("Только целое число")
      .min(0)
      .max(BOOKING_LIMITS.maxKids, "Максимум 10 детей"),
    kidsAges: z.string().trim().max(120, "Слишком длинно").optional(),
    comment: z.string().trim().max(1000, "Слишком длинно").optional(),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Требуется согласие на обработку данных" }),
    }),
  })
  .superRefine((value, ctx) => {
    if (value.hasKids && value.kidsCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["kidsCount"],
        message: "Укажите количество детей",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

export function BookingModal({
  river,
  dates,
  preselectedDateId,
  opened,
  onClose,
  variant = "classic",
}: BookingModalProps) {
  const styles = variant === "modern" ? modernStyles : classicStyles;
  const isModern = variant === "modern";
  const reducedMotion = useReducedMotion();
  const modernFormRef = useRef<HTMLFormElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedDateLabel, setSubmittedDateLabel] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const dateOptions = useMemo(
    () =>
      dates.map((splav) => ({
        value: splav.id,
        label: `${formatDateRangeFull(splav.startDate, splav.endDate)} · старт ${splav.startTime}`,
      })),
    [dates],
  );

  const defaultValues = useMemo(
    () => ({
      scheduleId: preselectedDateId ?? "",
      name: import.meta.env.DEV ? "Тест Тестов" : "",
      phone: import.meta.env.DEV ? "+375 (29) 111-22-33" : "+375 ",
      peopleCount: import.meta.env.DEV ? 2 : 1,
      hasKids: import.meta.env.DEV,
      kidsCount: import.meta.env.DEV ? 1 : 0,
      kidsAges: import.meta.env.DEV ? "7" : "",
      comment: import.meta.env.DEV ? "Тестовая заявка" : "",
      consent: import.meta.env.DEV ? true : (false as unknown as true),
    }),
    [preselectedDateId],
  );

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (opened) {
      setSubmitted(false);
      setSubmittedDateLabel(null);
      setError(null);
      reset(defaultValues);
    }
  }, [defaultValues, opened, reset]);

  useGSAP(
    () => {
      if (!opened || !isModern || submitted || reducedMotion || !modernFormRef.current) {
        return;
      }

      gsap.fromTo(
        "[data-field-reveal]",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.07,
          ease: "power3.out",
        },
      );
    },
    {
      scope: modernFormRef,
      dependencies: [opened, isModern, submitted, reducedMotion],
    },
  );

  const hasKids = watch("hasKids");

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setSubmittedDateLabel(null);
      setError(null);
      reset(defaultValues);
    }, 200);
  };

  const onSubmit = async (data: FormValues) => {
    setError(null);

    const selectedDate = dates.find((item) => item.id === data.scheduleId);
    if (!selectedDate) {
      setError(
        "Выбранная дата недоступна. Обновите страницу и попробуйте ещё раз.",
      );
      return;
    }

    const selectedDateLabel =
      dateOptions.find((option) => option.value === selectedDate.id)?.label ??
      formatDateRangeFull(selectedDate.startDate, selectedDate.endDate);

    try {
      await submitBooking({
        name: data.name,
        phone: normalizePhone(data.phone),
        peopleCount: data.peopleCount,
        kidsCount: data.hasKids ? data.kidsCount : 0,
        kidsAges: data.hasKids ? data.kidsAges || "" : "",
        tripTitle: selectedDate.title || `Сплав по р. ${river.river}`,
        tripDate: selectedDate.startDate,
        tripTime: selectedDate.startTime,
        scheduleId: selectedDate.id,
        riverId: river.id,
        riverName: river.river,
        comment: data.comment,
      });
      setSubmittedDateLabel(selectedDateLabel);
      setSubmitted(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? `Не удалось отправить: ${e.message}. Проверьте интернет и попробуйте ещё раз.`
          : "Не удалось отправить заявку. Попробуйте ещё раз.",
      );
    }
  };

  const riverMeta = [
    `р. ${river.river}`,
    river.distance,
    river.time,
    river.price,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Modal
      opened={opened}
      onClose={isSubmitting ? () => undefined : handleClose}
      title={
        isModern ? undefined : (
          <Title order={3} className={styles.title}>
            {submitted ? "Заявка отправлена" : "Записаться на сплав"}
          </Title>
        )
      }
      centered
      size="md"
      radius={isModern ? "lg" : "md"}
      closeOnClickOutside={!isSubmitting}
      closeOnEscape={!isSubmitting}
      withCloseButton={!isSubmitting}
      overlayProps={{ backgroundOpacity: 0.55, blur: isModern ? 8 : 3 }}
      classNames={
        isModern
          ? {
              header: modernStyles.hiddenHeader,
              content: modernStyles.modalContent,
              body: modernStyles.modalBody,
            }
          : undefined
      }
    >
      {submitted ? (
        isModern ? (
          <div className={modernStyles.successWrap}>
            <h3 className={modernStyles.successTitle}>Заявка отправлена</h3>
            <p className={modernStyles.successText}>
              Спасибо! Заявка на <b>сплав по р. {river.river}</b>
              {submittedDateLabel ? ` на ${submittedDateLabel}` : ""} отправлена.
              Мы свяжемся с вами в ближайшее время.
            </p>
            <V2Button variant="primary" fullWidth onClick={handleClose}>
              Закрыть
            </V2Button>
          </div>
        ) : (
          <Stack gap="md">
            <Text>
              Спасибо! Заявка на <b>сплав по р. {river.river}</b>
              {submittedDateLabel ? ` на ${submittedDateLabel}` : ""} отправлена.
              Мы свяжемся с вами в ближайшее время по указанному номеру.
            </Text>
            <Button onClick={handleClose} fullWidth>
              Закрыть
            </Button>
          </Stack>
        )
      ) : isModern ? (
        <form
          ref={modernFormRef}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={modernStyles.formRoot}
          data-booking-variant={variant}
        >
          <div className={modernStyles.modalHeader} data-field-reveal>
            <p className={modernStyles.eyebrow}>Запись</p>
            <h2 className={modernStyles.title}>Записаться на сплав</h2>
            <p className={modernStyles.riverMeta}>{riverMeta}</p>
          </div>

          <div className={modernStyles.formScroll}>
            <div className={modernStyles.fieldGroup} data-field-reveal>
              <span className={modernStyles.fieldLabel}>Дата сплава</span>
              {dateOptions.length > 0 ? (
                <Controller
                  control={control}
                  name="scheduleId"
                  render={({ field }) => (
                    <Select
                      variant="unstyled"
                      placeholder="Выберите дату и время старта"
                      aria-label="Выберите дату и время старта"
                      data={dateOptions}
                      value={field.value}
                      onChange={(value) => field.onChange(value ?? "")}
                      onBlur={field.onBlur}
                      error={errors.scheduleId?.message}
                      disabled={isSubmitting}
                      searchable={dateOptions.length > 6}
                      nothingFoundMessage="Даты не найдены"
                    />
                  )}
                />
              ) : (
                <Alert color="yellow" variant="light">
                  Пока нет активных дат для этого сплава. Напишите нам —
                  подберём дату.
                </Alert>
              )}
            </div>

            <div className={modernStyles.fieldGroup} data-field-reveal>
              <span className={modernStyles.fieldLabel}>Контакты</span>
              <TextInput
                variant="unstyled"
                placeholder="Имя и фамилия"
                aria-label="Имя и фамилия"
                autoComplete="name"
                error={errors.name?.message}
                disabled={isSubmitting}
                {...register("name")}
              />
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <TextInput
                    variant="unstyled"
                    placeholder="Телефон: +375 (29) 123-45-67"
                    aria-label="Телефон"
                    inputMode="tel"
                    autoComplete="tel"
                    error={errors.phone?.message}
                    disabled={isSubmitting}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(formatPhone(e.currentTarget.value))
                    }
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>

            <div className={modernStyles.participantsBlock} data-field-reveal>
              <Controller
                control={control}
                name="peopleCount"
                render={({ field }) => (
                  <div className={modernStyles.stepperRow}>
                    <span className={modernStyles.stepperLabel}>
                      Участников
                    </span>
                    <div className={modernStyles.stepperControls}>
                      <ActionIcon
                        variant="subtle"
                        className={modernStyles.counterButton}
                        onClick={() =>
                          field.onChange(Math.max(1, Number(field.value) - 1))
                        }
                        disabled={isSubmitting}
                        aria-label="Уменьшить количество участников"
                      >
                        <IconMinus size={18} stroke={2.4} />
                      </ActionIcon>
                      <span className={modernStyles.stepperValue}>
                        {field.value}
                      </span>
                      <ActionIcon
                        variant="subtle"
                        className={modernStyles.counterButton}
                        onClick={() =>
                          field.onChange(
                            Math.min(
                              BOOKING_LIMITS.maxPeople,
                              Number(field.value) + 1,
                            ),
                          )
                        }
                        disabled={isSubmitting}
                        aria-label="Увеличить количество участников"
                      >
                        <IconPlus size={18} stroke={2.4} />
                      </ActionIcon>
                    </div>
                  </div>
                )}
              />
              {errors.peopleCount?.message && (
                <Text size="xs" c="red">
                  {errors.peopleCount.message}
                </Text>
              )}
              {watch("peopleCount") === 1 && (
                <p className={modernStyles.hint}>
                  Если вы один — укажем формат байдарки и согласуем экипаж
                  заранее.
                </p>
              )}

              <Controller
                control={control}
                name="hasKids"
                render={({ field }) => (
                  <div className={modernStyles.kidsRow}>
                    <span className={modernStyles.stepperLabel}>
                      Будут дети до 12 лет
                    </span>
                    <Switch
                      checked={field.value}
                      disabled={isSubmitting}
                      onChange={(event) => {
                        const checked = event.currentTarget.checked;
                        field.onChange(checked);
                        if (checked && watch("kidsCount") === 0) {
                          setValue("kidsCount", 1, { shouldValidate: true });
                        }
                        if (!checked) {
                          setValue("kidsCount", 0, { shouldValidate: true });
                          setValue("kidsAges", "");
                        }
                      }}
                    />
                  </div>
                )}
              />

              {hasKids && (
                <div className={modernStyles.kidsFields}>
                  <Controller
                    control={control}
                    name="kidsCount"
                    render={({ field }) => (
                      <div className={modernStyles.stepperRow}>
                        <span className={modernStyles.stepperLabel}>
                          Детей
                        </span>
                        <div className={modernStyles.stepperControls}>
                          <ActionIcon
                            variant="subtle"
                            className={modernStyles.counterButton}
                            onClick={() =>
                              field.onChange(
                                Math.max(1, Number(field.value) - 1),
                              )
                            }
                            disabled={isSubmitting}
                            aria-label="Уменьшить количество детей"
                          >
                            <IconMinus size={18} stroke={2.4} />
                          </ActionIcon>
                          <span className={modernStyles.stepperValue}>
                            {field.value}
                          </span>
                          <ActionIcon
                            variant="subtle"
                            className={modernStyles.counterButton}
                            onClick={() =>
                              field.onChange(
                                Math.min(
                                  BOOKING_LIMITS.maxKids,
                                  Number(field.value) + 1,
                                ),
                              )
                            }
                            disabled={isSubmitting}
                            aria-label="Увеличить количество детей"
                          >
                            <IconPlus size={18} stroke={2.4} />
                          </ActionIcon>
                        </div>
                      </div>
                    )}
                  />
                  {errors.kidsCount?.message && (
                    <Text size="xs" c="red">
                      {errors.kidsCount.message}
                    </Text>
                  )}
                  <TextInput
                    variant="unstyled"
                    placeholder="Возраст детей, например: 6 и 10 лет"
                    aria-label="Возраст детей"
                    error={errors.kidsAges?.message}
                    disabled={isSubmitting}
                    {...register("kidsAges")}
                  />
                </div>
              )}
            </div>

            <div className={modernStyles.fieldGroup} data-field-reveal>
              <span className={modernStyles.fieldLabel}>Комментарий</span>
              <Textarea
                variant="unstyled"
                placeholder="Вопрос или важная информация"
                aria-label="Комментарий"
                minRows={2}
                autosize
                error={errors.comment?.message}
                disabled={isSubmitting}
                {...register("comment")}
              />
            </div>

            <div className={modernStyles.fieldGroup} data-field-reveal>
              <Controller
                control={control}
                name="consent"
                render={({ field }) => (
                  <Checkbox
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.currentTarget.checked)}
                    onBlur={field.onBlur}
                    disabled={isSubmitting}
                    error={errors.consent?.message}
                    label="Согласен на обработку персональных данных в соответствии с Законом Республики Беларусь № 99-З"
                  />
                )}
              />
            </div>

            {error && (
              <Alert color="red" variant="light" data-field-reveal>
                {error}
              </Alert>
            )}
          </div>

          <div className={modernStyles.formFooter}>
            <V2Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isSubmitting}
              disabled={dateOptions.length === 0}
            >
              Отправить заявку
            </V2Button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={styles.formRoot}
          data-booking-variant={variant}
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              {riverMeta}
            </Text>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHead}>
                <span className={`${styles.sectionIcon} ${styles.iconBlue}`}>
                  <IconCalendarEvent size={15} stroke={2} />
                </span>
                <span className={styles.sectionTitle}>Дата сплава</span>
              </div>

              {dateOptions.length > 0 ? (
                <Controller
                  control={control}
                  name="scheduleId"
                  render={({ field }) => (
                    <Select
                      placeholder="Выберите дату и время старта"
                      aria-label="Выберите дату и время старта"
                      data={dateOptions}
                      value={field.value}
                      onChange={(value) => field.onChange(value ?? "")}
                      onBlur={field.onBlur}
                      error={errors.scheduleId?.message}
                      disabled={isSubmitting}
                      searchable={dateOptions.length > 6}
                      nothingFoundMessage="Даты не найдены"
                    />
                  )}
                />
              ) : (
                <Alert color="yellow" variant="light">
                  Пока нет активных дат для этого сплава. Напишите нам —
                  подберём дату.
                </Alert>
              )}
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHead}>
                <span className={`${styles.sectionIcon} ${styles.iconBlue}`}>
                  <IconUser size={15} stroke={2} />
                </span>
                <span className={styles.sectionTitle}>Контакты</span>
              </div>

              <Stack gap="sm">
                <TextInput
                  placeholder="Имя и фамилия, например Иван Иванов"
                  aria-label="Имя и фамилия"
                  autoComplete="name"
                  error={errors.name?.message}
                  disabled={isSubmitting}
                  {...register("name")}
                />

                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <TextInput
                      placeholder="Телефон с Viber/Telegram: +375 (29) 123-45-67"
                      aria-label="Телефон с Viber или Telegram"
                      inputMode="tel"
                      autoComplete="tel"
                      error={errors.phone?.message}
                      disabled={isSubmitting}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(formatPhone(e.currentTarget.value))
                      }
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </Stack>
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHead}>
                <span className={`${styles.sectionIcon} ${styles.iconGreen}`}>
                  <IconUsers size={15} stroke={2} />
                </span>
                <span className={styles.sectionTitle}>Участники</span>
              </div>

              <Stack gap="sm">
                <Controller
                  control={control}
                  name="peopleCount"
                  render={({ field }) => (
                    <Stack gap={6}>
                      <Text fw={500}>Количество участников</Text>
                      <Group justify="space-between" align="center">
                        <ActionIcon
                          variant="filled"
                          color="green"
                          radius="xl"
                          size={46}
                          onClick={() =>
                            field.onChange(Math.max(1, Number(field.value) - 1))
                          }
                          disabled={isSubmitting}
                          aria-label="Уменьшить количество участников"
                        >
                          <IconMinus size={20} stroke={2.4} />
                        </ActionIcon>

                        <Text fw={700} fz={24} w={48} ta="center">
                          {field.value}
                        </Text>

                        <ActionIcon
                          variant="filled"
                          color="green"
                          radius="xl"
                          size={46}
                          onClick={() =>
                            field.onChange(
                              Math.min(
                                BOOKING_LIMITS.maxPeople,
                                Number(field.value) + 1,
                              ),
                            )
                          }
                          disabled={isSubmitting}
                          aria-label="Увеличить количество участников"
                        >
                          <IconPlus size={20} stroke={2.4} />
                        </ActionIcon>
                      </Group>

                      {errors.peopleCount?.message && (
                        <Text size="xs" c="red">
                          {errors.peopleCount.message}
                        </Text>
                      )}

                      {field.value === 1 && (
                        <Text size="xs" className={styles.hint}>
                          Если вы записываетесь один, можно указать желаемый
                          формат байдарки (2- или 3-местная). Подберём экипаж и
                          согласуем посадку с вами заранее.
                        </Text>
                      )}
                    </Stack>
                  )}
                />

                <div className={styles.kidsCounter}>
                  <Controller
                    control={control}
                    name="hasKids"
                    render={({ field }) => (
                      <Group
                        justify="space-between"
                        align="center"
                        wrap="nowrap"
                      >
                        <Stack gap={0}>
                          <Group gap={6}>
                            <span
                              className={`${styles.sectionIcon} ${styles.iconAmber}`}
                            >
                              <IconMoodKid size={15} stroke={2} />
                            </span>
                            <Text fw={600}>Будут ли дети?</Text>
                          </Group>
                          <Text size="xs" className={styles.hint}>
                            До 12 лет — детский тариф, от 12 лет — взрослый.
                          </Text>
                        </Stack>
                        <Switch
                          checked={field.value}
                          disabled={isSubmitting}
                          onChange={(event) => {
                            const checked = event.currentTarget.checked;
                            field.onChange(checked);
                            if (checked && watch("kidsCount") === 0) {
                              setValue("kidsCount", 1, {
                                shouldValidate: true,
                              });
                            }
                            if (!checked) {
                              setValue("kidsCount", 0, {
                                shouldValidate: true,
                              });
                              setValue("kidsAges", "");
                            }
                          }}
                        />
                      </Group>
                    )}
                  />

                  {hasKids && (
                    <Stack gap="xs" mt="sm">
                      <Controller
                        control={control}
                        name="kidsCount"
                        render={({ field }) => (
                          <Stack gap={4}>
                            <Group justify="space-between" align="center">
                              <Stack gap={0}>
                                <Text fw={500}>Количество детей</Text>
                                <Text size="xs" c="dimmed">
                                  до 12 лет
                                </Text>
                              </Stack>
                              <Group gap="xs">
                                <ActionIcon
                                  variant="light"
                                  color="orange"
                                  radius="xl"
                                  size="lg"
                                  onClick={() =>
                                    field.onChange(
                                      Math.max(1, Number(field.value) - 1),
                                    )
                                  }
                                  disabled={isSubmitting}
                                  aria-label="Уменьшить количество детей"
                                >
                                  <IconMinus size={18} stroke={2.4} />
                                </ActionIcon>
                                <Text fw={600} w={18} ta="center">
                                  {field.value}
                                </Text>
                                <ActionIcon
                                  variant="light"
                                  color="orange"
                                  radius="xl"
                                  size="lg"
                                  onClick={() =>
                                    field.onChange(
                                      Math.min(
                                        BOOKING_LIMITS.maxKids,
                                        Number(field.value) + 1,
                                      ),
                                    )
                                  }
                                  disabled={isSubmitting}
                                  aria-label="Увеличить количество детей"
                                >
                                  <IconPlus size={18} stroke={2.4} />
                                </ActionIcon>
                              </Group>
                            </Group>
                            {errors.kidsCount?.message && (
                              <Text size="xs" c="red">
                                {errors.kidsCount.message}
                              </Text>
                            )}
                          </Stack>
                        )}
                      />

                      <TextInput
                        placeholder="Возраст детей, например: 6 и 10 лет"
                        aria-label="Возраст детей"
                        error={errors.kidsAges?.message}
                        disabled={isSubmitting}
                        {...register("kidsAges")}
                      />
                    </Stack>
                  )}
                </div>
              </Stack>
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHead}>
                <span className={`${styles.sectionIcon} ${styles.iconViolet}`}>
                  <IconMessageCircle size={15} stroke={2} />
                </span>
                <span className={styles.sectionTitle}>Комментарий</span>
              </div>
              <Textarea
                placeholder="Вопрос или важная информация для организаторов"
                aria-label="Комментарий для организаторов"
                minRows={3}
                autosize
                error={errors.comment?.message}
                disabled={isSubmitting}
                {...register("comment")}
              />
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHead}>
                <span className={`${styles.sectionIcon} ${styles.iconRose}`}>
                  <IconLock size={15} stroke={2} />
                </span>
                <span className={styles.sectionTitle}>Согласие</span>
              </div>
              <Controller
                control={control}
                name="consent"
                render={({ field }) => (
                  <Checkbox
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.currentTarget.checked)}
                    onBlur={field.onBlur}
                    disabled={isSubmitting}
                    error={errors.consent?.message}
                    label={
                      <Text size="sm">
                        Согласен на обработку персональных данных в соответствии
                        с Законом Республики Беларусь № 99-З «О защите
                        персональных данных»
                      </Text>
                    }
                  />
                )}
              />
            </div>

            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              size="md"
              loading={isSubmitting}
              disabled={dateOptions.length === 0}
              fullWidth
            >
              Отправить заявку
            </Button>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
