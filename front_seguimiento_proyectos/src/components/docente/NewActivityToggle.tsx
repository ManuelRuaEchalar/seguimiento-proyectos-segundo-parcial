// app/grupo/[id]/NewActivityToggle.tsx
import styles from './styles/NewActivityToggle.module.css';

export default function NewActivityToggle({ showForm, setShowForm }: { showForm: boolean; setShowForm: (val: boolean) => void }) {
  const toggle = () => setShowForm(!showForm);
  return (
    <div className={styles.newActivityToggle}>
      <button className={styles.newActivityBtn} onClick={toggle}>
        {showForm ? 'Cerrar Nueva Actividad' : 'Nueva Actividad'}
      </button>
      <button className={styles.newActivityPlusBtn} onClick={toggle}>
        {showForm ? '−' : '+'}
      </button>
    </div>
  );
}