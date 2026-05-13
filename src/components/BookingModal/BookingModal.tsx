import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Button,
  Checkbox,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import type { Splav } from '../../types/splav';
import styles from './BookingModal.module.css';

interface BookingModalProps {
  splav: Splav;
  opened: boolean;
  onClose: () => void;
}

// +375 (XX) XXX-XX-XX — 9 цифр после +375
const phoneRegex = /^\+375\s?\(?\d{2}\)?\s?\d{3}-?\d{2}-?\d{2}$/;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Имя слишком короткое')
    .max(60, 'Имя слишком длинное'),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Формат: +375 (XX) XXX-XX-XX'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Требуется согласие на обработку данных' }),
  }),
});

type FormValues = z.infer<typeof schema>;

/** Маска ввода телефона для +375 */
function formatPhone(raw: string): string {
  // оставляем только цифры
  const digits = raw.replace(/\D/g, '');
  // если начинается с 375 — снимаем (будем добавлять префиксом)
  const tail = digits.startsWith('375') ? digits.slice(3) : digits;
  const d = tail.slice(0, 9); // макс 9 цифр

  if (d.length === 0) return '+375 ';

  let out = '+375 (';
  out += d.slice(0, 2);
  if (d.length >= 2) out += ') ';
  if (d.length > 2) out += d.slice(2, 5);
  if (d.length > 5) out += '-' + d.slice(5, 7);
  if (d.length > 7) out += '-' + d.slice(7, 9);
  return out;
}

export function BookingModal({ splav, opened, onClose }: BookingModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '+375 ', consent: false as unknown as true },
    mode: 'onTouched',
  });

  const handleClose = () => {
    onClose();
    // сброс с задержкой, чтобы не дёргалось во время анимации
    setTimeout(() => {
      setSubmitted(false);
      setError(null);
      reset();
    }, 200);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // TODO: позже здесь будет fetch на Google Apps Script Web App
      // eslint-disable-next-line no-console
      console.log('[booking]', {
        splavId: splav.id,
        splavTitle: splav.title,
        name: data.name,
        phone: data.phone,
        consent: data.consent,
        submittedAt: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось отправить заявку');
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Title order={3} className={styles.title}>
          {submitted ? 'Заявка отправлена' : 'Записаться на сплав'}
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
            Спасибо! Мы получили вашу заявку на сплав <b>«{splav.title}»</b> и
            свяжемся с вами в ближайшее время.
          </Text>
          <Button onClick={handleClose} fullWidth>
            Закрыть
          </Button>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              {splav.title} · {splav.river}
            </Text>

            <TextInput
              label="Имя"
              placeholder="Иван"
              autoComplete="given-name"
              error={errors.name?.message}
              {...register('name')}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <TextInput
                  label="Телефон"
                  placeholder="+375 (29) 123-45-67"
                  inputMode="tel"
                  autoComplete="tel"
                  error={errors.phone?.message}
                  value={field.value}
                  onChange={(e) => field.onChange(formatPhone(e.currentTarget.value))}
                  onBlur={field.onBlur}
                />
              )}
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
                      Согласен на обработку персональных данных в соответствии
                      с Законом Республики Беларусь № 99-З «О защите
                      персональных данных»
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
