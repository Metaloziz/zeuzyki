import { useMemo, useState } from "react";
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
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import type { Splav } from "../../types/splav";
import { submitBooking } from "../../lib/sheetsApi";
import styles from "./BookingModal.module.css";

interface BookingModalProps {
  splav: Splav;
  opened: boolean;
  onClose: () => void;
}

// +375 (XX) XXX-XX-XX — 9 цифр после +375
const phoneRegex = /^\+375\s?\(?\d{2}\)?\s?\d{3}-?\d{2}-?\d{2}$/;

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const tail = digits.startsWith("375") ? digits.slice(3) : digits;
  return `+375${tail.slice(0, 9)}`;
}

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Слишком короткое")
      .max(120, "Слишком длинное"),
    phone: z.string().trim().regex(phoneRegex, "Формат: +375 (XX) XXX-XX-XX"),
    peopleCount: z
      .number({ invalid_type_error: "Укажите количество участников" })
      .int("Только целое число")
      .min(1, "Минимум 1 человек")
      .max(20, "Максимум 20 человек"),
    hasKids: z.boolean(),
    kidsCount: z
      .number({ invalid_type_error: "Укажите количество детей" })
      .int("Только целое число")
      .min(0)
      .max(10, "Максимум 10 детей"),
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

/** Маска ввода телефона для +375 */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const tail = digits.startsWith("375") ? digits.slice(3) : digits;
  const d = tail.slice(0, 9);

  if (d.length === 0) return "+375 ";

  let out = "+375 (";
  out += d.slice(0, 2);
  if (d.length >= 2) out += ") ";
  if (d.length > 2) out += d.slice(2, 5);
  if (d.length > 5) out += "-" + d.slice(5, 7);
  if (d.length > 7) out += "-" + d.slice(7, 9);
  return out;
}

export function BookingModal({ splav, opened, onClose }: BookingModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => ({
      name: import.meta.env.DEV ? "Тест Тестов" : "",
      phone: import.meta.env.DEV ? "+375 (29) 111-22-33" : "+375 ",
      peopleCount: import.meta.env.DEV ? 2 : 1,
      hasKids: import.meta.env.DEV,
      kidsCount: import.meta.env.DEV ? 1 : 0,
      kidsAges: import.meta.env.DEV ? "7" : "",
      comment: import.meta.env.DEV ? "Тестовая заявка" : "",
      consent: import.meta.env.DEV ? true : (false as unknown as true),
    }),
    [],
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

  const hasKids = watch("hasKids");

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setError(null);
      reset(defaultValues);
    }, 200);
  };

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      await submitBooking({
        name: data.name,
        phone: normalizePhone(data.phone),
        peopleCount: data.peopleCount,
        kidsCount: data.hasKids ? data.kidsCount : 0,
        kidsAges: data.hasKids ? data.kidsAges || "" : "",
        tripTitle: splav.title,
        tripDate: splav.startDate,
        comment: data.comment,
      });
      setSubmitted(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? `Не удалось отправить: ${e.message}. Проверьте интернет и попробуйте ещё раз.`
          : "Не удалось отправить заявку. Попробуйте ещё раз.",
      );
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Title order={3} className={styles.title}>
          {submitted ? "Заявка отправлена" : "Записаться на сплав"}
        </Title>
      }
      centered
      size="md"
      radius="md"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      {submitted ? (
        <Stack gap="md">
          <Text>
            Спасибо! Заявка на <b>«{splav.title}»</b> отправлена. Мы свяжемся с
            вами в ближайшее время по указанному номеру.
          </Text>
          <Button onClick={handleClose} fullWidth>
            Закрыть
          </Button>
        </Stack>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={styles.formRoot}
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              {splav.title} · р. {splav.river}
            </Text>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHead}>
                <span className={`${styles.sectionIcon} ${styles.iconBlue}`}>
                  👤
                </span>
                <span className={styles.sectionTitle}>Контакты</span>
              </div>

              <Stack gap="sm">
                <TextInput
                  label="Имя и фамилия"
                  placeholder="Иван Иванов"
                  autoComplete="name"
                  error={errors.name?.message}
                  {...register("name")}
                />

                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <TextInput
                      label="Телефон (с Viber/Telegram)"
                      placeholder="+375 (29) 123-45-67"
                      inputMode="tel"
                      autoComplete="tel"
                      error={errors.phone?.message}
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
                  👥
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
                          aria-label="Уменьшить количество участников"
                        >
                          −
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
                              Math.min(20, Number(field.value) + 1),
                            )
                          }
                          aria-label="Увеличить количество участников"
                        >
                          +
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
                              🧒
                            </span>
                            <Text fw={600}>Будут ли дети?</Text>
                          </Group>
                          <Text size="xs" className={styles.hint}>
                            До 12 лет — детский тариф, от 12 лет — взрослый.
                          </Text>
                        </Stack>
                        <Switch
                          checked={field.value}
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
                                  до 14 лет
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
                                >
                                  −
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
                                      Math.min(10, Number(field.value) + 1),
                                    )
                                  }
                                >
                                  +
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
                        label="Возраст детей"
                        placeholder="Например: 6 и 10 лет"
                        error={errors.kidsAges?.message}
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
                  💬
                </span>
                <span className={styles.sectionTitle}>Комментарий</span>
              </div>
              <Textarea
                description="Укажите вопрос или важную информацию, которую организаторам стоит учесть"
                minRows={3}
                autosize
                error={errors.comment?.message}
                {...register("comment")}
              />
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHead}>
                <span className={`${styles.sectionIcon} ${styles.iconRose}`}>
                  🔒
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

            <Button type="submit" size="md" loading={isSubmitting} fullWidth>
              Отправить заявку
            </Button>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
