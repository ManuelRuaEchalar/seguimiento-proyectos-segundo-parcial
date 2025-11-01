import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Header.module.css";

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | string;
};

type HeaderProps = {
  title?: string;
  actions?: Action[]; // optional list of actions/buttons to render on the right
};

export default function Header({
  title = "PROYECTOS USFX",
  actions = [],
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Image src="/logo.svg" alt="logo" width={36} height={36} />
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>
        {actions.map((a, idx) => {
          const cls = a.variant === "primary" ? styles.primary : a.variant === "danger" ? styles.danger : styles.ghost;
          if (a.href) {
            // New Link usage: pass className and onClick directly to Link
            return (
              <Link href={a.href} key={idx} className={cls} onClick={a.onClick}>
                {a.label}
              </Link>
            );
          }

          return (
            <button key={idx} className={cls} onClick={a.onClick}>
              {a.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
