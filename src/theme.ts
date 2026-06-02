import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Brand cyan #00b8d4 — основной фирменный цвет
const brandCyan: MantineColorsTuple = [
  "#e0f7fa",
  "#b2ebf2",
  "#80deea",
  "#4dd0e1",
  "#26c6da",
  "#00bcd4",
  "#00b8d4",
  "#0097a7",
  "#00838f",
  "#006064",
];

// Brand green #8bc34a — фирменный акцент
const brandFresh: MantineColorsTuple = [
  "#f1f8e9",
  "#dcedc8",
  "#c5e1a5",
  "#aed581",
  "#9ccc65",
  "#8bc34a",
  "#7cb342",
  "#689f38",
  "#558b2f",
  "#33691e",
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
