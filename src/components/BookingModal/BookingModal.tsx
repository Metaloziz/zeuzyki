import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Button,
  Checkbox,
  Modal,
  Radio,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import type { Splav } from "../../types/splav";
import { ENTRY, getOptions, submitBooking } from "../../lib/googleForm";
import styles from "./BookingModal.module.css";

interface BookingModalProps {
  splav: Splav;
  opened: boolean;
  onClose: () => void;
}

// +375 (XX) XXX-XX-XX — 9 цифр после +375
const phoneRegex = /^\+375\s?\(?\d{2}\)?\s?\d{3}-?\d{2}-?\d{2}$/;

const buildSchema = (transferOptions: readonly string[]) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2, "Слишком короткое")
      .max(120, "Слишком длинное"),
    phone: z.string().trim().regex(phoneRegex, "Формат: +375 (XX) XXX-XX-XX"),
    transfer:
      transferOptions.length > 0
        ? z.enum(transferOptions as [string, ...string[]], {
            errorMap: () => ({ message: "Выберите один из вариантов" }),
          })
        : z.string().min(2, "Укажите ответ"),
    participants: z
      .string()
      .trim()
      .min(1, "Поле обязательное (если едете один — напишите «один»)")
      .max(1000, "Слишком длинно"),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Требуется согласие на обработку данных" }),
    }),
  });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

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

  const transferOptions = useMemo(() => getOptions(ENTRY.transfer), []);
  const schema = useMemo(() => buildSchema(transferOptions), [transferOptions]);

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "+375 ",
      transfer: "" as FormValues["transfer"],
      participants: "",
      consent: false as unknown as true,
    },
    mode: "onTouched",
  });

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setError(null);
      reset();
    }, 200);
  };

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      await submitBooking({
        date: splav.formDateValue,
        name: data.name,
        phone: data.phone,
        transfer: data.transfer,
        participants: data.participants,
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
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              {splav.title} · р. {splav.river}
            </Text>

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

            <Controller
              control={control}
              name="transfer"
              render={({ field }) => (
                <Radio.Group
                  label="Нужен ли подвоз из города?"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.transfer?.message}
                >
                  <Stack gap="xs" mt="xs">
                    {transferOptions.map((opt) => (
                      <Radio key={opt} value={opt} label={opt} />
                    ))}
                  </Stack>
                </Radio.Group>
              )}
            />

            <Textarea
              label="Другие участники"
              description="Фамилии, имена и телефоны тех, кто едет с вами (кроме вас). Если едете один — напишите «один». Если есть дети — укажите возраст."
              placeholder='Например: "Петров Пётр +375 29 000-00-00, ребёнок 10 лет"'
              minRows={3}
              autosize
              error={errors.participants?.message}
              {...register("participants")}
            />

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
                      Согласен на обработку персональных данных в соответствии с
                      Законом Республики Беларусь № 99-З «О защите персональных
                      данных»
                    </Text>
                  }
                />
              )}
            />

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
