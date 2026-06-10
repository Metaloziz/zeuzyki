import styles from "./LogoMark.module.css";

const logo = `${import.meta.env.BASE_URL}assets/logo.png`;

export function LogoMark() {
  return (
    <img src={logo} alt="" aria-hidden="true" className={styles.logoMark} />
  );
}
