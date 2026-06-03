import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Brand cyan #00CEF4 — основной фирменный цвет
const brandCyan: MantineColorsTuple = [
  "#e5fbff",
  "#b8f4ff",
  "#86ecff",
  "#5de6ff",
  "#2fdfff",
  "#00d6ff",
  "#00cef4",
  "#00a7c7",
  "#007f99",
  "#005c70",
];

// Brand green #8BCA2E — фирменный акцент
const brandFresh: MantineColorsTuple = [
  "#f2fae8",
  "#e0f4c8",
  "#cbea9f",
  "#b5e46a",
  "#a0d94c",
  "#8bca2e",
  "#7ab326",
  "#6fa321",
  "#4f7b18",
  "#375f12",
];

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 5 },
  colors: {
    brand: brandCyan,
    fresh: brandFresh,
  },
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
  headings: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: "700",
  },
  defaultRadius: "md",
  components: {
    Button: {
      defaultProps: {
        radius: "xl",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Textarea: {
      defaultProps: {
        radius: "md",
      },
    },
    Modal: {
      defaultProps: {
        radius: "lg",
      },
    },
  },
});
