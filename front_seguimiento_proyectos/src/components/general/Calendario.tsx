'use client';

import { useState } from 'react';
import styles from './styles/Calendario.module.css';

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayIndex = firstDay.getDay();
  const prevLastDay = new Date(year, month, 0).getDate();

  const today = new Date();
  const isToday = (day: number, month: number, year: number) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const renderDays = () => {
    const days = [];

    // Días del mes anterior
    for (let i = firstDayIndex; i > 0; i--) {
      days.push(
        <div key={`prev-${i}`} className={`${styles.calendarDay} ${styles.otherMonth}`}>
          {prevLastDay - i + 1}
        </div>
      );
    }

    // Días del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const isTodayClass = isToday(i, month, year) ? styles.today : '';
      days.push(
        <div key={`current-${i}`} className={`${styles.calendarDay} ${isTodayClass}`}>
          {i}
        </div>
      );
    }

    // Días del próximo mes
    const totalCells = 42;
    const daysInGrid = firstDayIndex + lastDay.getDate();
    const nextDays = totalCells - daysInGrid;

    for (let i = 1; i <= nextDays; i++) {
      days.push(
        <div key={`next-${i}`} className={`${styles.calendarDay} ${styles.otherMonth}`}>
          {i}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles.calendarSection}>
      <div className={styles.calendarHeader}>
        <div className={styles.calendarTitle}>
          {monthNames[month]} {year}
        </div>
        <div className={styles.calendarNav}>
          <button className={styles.calendarNavBtn} onClick={handlePrevMonth}>
            ‹
          </button>
          <button className={styles.calendarNavBtn} onClick={handleNextMonth}>
            ›
          </button>
        </div>
      </div>
      <div className={styles.calendarGrid}>
        {dayNames.map((day) => (
          <div key={day} className={styles.calendarDayHeader}>
            {day}
          </div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
}