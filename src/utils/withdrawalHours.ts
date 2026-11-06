export interface WithdrawalHoursStatus {
  isOpen: boolean;
  currentHour: number;
  currentMinute: number;
  openHour: number; // 10:00 AM
  closeHour: number; // 22:00 (10:00 PM)
  formattedTime: string;
  statusText: string;
  message: string;
  nextOpenNotice: string;
}

/**
 * Checks whether the current time falls within withdrawal operating hours:
 * Open: 10:00 AM (10:00) to 10:00 PM (22:00)
 * Closed: 10:00 PM (22:00) to 10:00 AM (10:00)
 */
export function checkWithdrawalHours(date: Date = new Date()): WithdrawalHoursStatus {
  const currentHour = date.getHours(); // 0-23
  const currentMinute = date.getMinutes();

  // Active: between 10:00 AM (10) and 10:00 PM (22)
  const isOpen = currentHour >= 10 && currentHour < 22;

  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  if (isOpen) {
    return {
      isOpen: true,
      currentHour,
      currentMinute,
      openHour: 10,
      closeHour: 22,
      formattedTime,
      statusText: 'Active (10:00 AM – 10:00 PM)',
      message: 'Withdrawal service is currently OPEN. Requests are processed promptly via Binance.',
      nextOpenNotice: 'Open until 10:00 PM tonight',
    };
  } else {
    return {
      isOpen: false,
      currentHour,
      currentMinute,
      openHour: 10,
      closeHour: 22,
      formattedTime,
      statusText: 'Closed (10:00 PM – 10:00 AM)',
      message: 'Withdrawal is CLOSED from 10:00 PM to 10:00 AM daily. Please submit your withdrawal request between 10:00 AM and 10:00 PM.',
      nextOpenNotice: 'Resumes today at 10:00 AM',
    };
  }
}
