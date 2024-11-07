import Badge from '@mui/material/Badge';
import { DateView } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';

function fetchApi(date: Dayjs, { signal }: { signal: AbortSignal }) {
  return new Promise<{ daysToHighlight: number[] }>(async (resolve, reject) => {
    const API_ADDRESS = 'http://localhost:4000/api/planning';

    const { data } = await axios.get(`${API_ADDRESS}/${date.year()}/${date.month() + 1}`);

    const daysToHighlight = Object.keys(data.items).map(day => Number(day))

    resolve({ daysToHighlight });

    signal.onabort = () => { reject(new DOMException('aborted', 'AbortError')) };
  });
}

const initialValue = dayjs();

function ServerDay(props: PickersDayProps<Dayjs> & { highlightedDays?: number[] }) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

  const isSelected =
    !props.outsideCurrentMonth && highlightedDays.indexOf(props.day.date()) >= 0;

  return (
    <Badge
      key={props.day.toString()}
      overlap="circular"
      badgeContent={isSelected && '🟢'}
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
}

export default function Calendar({ show, loadItemsByDate }) {
  const requestAbortController = useRef<AbortController | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState([]);

  const fetchHighlightedDays = (date: Dayjs) => {
    const controller = new AbortController();

    fetchApi(date, {
      signal: controller.signal,
    })
      .then(({ daysToHighlight }) => {
        setHighlightedDays(daysToHighlight);
        setIsLoading(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          throw error;
        }
      });

    requestAbortController.current = controller;
  };

  useEffect(() => {
    fetchHighlightedDays(initialValue);
    return () => requestAbortController.current?.abort();
  }, []);

  const handleMonthChange = (date: Dayjs) => {
    if (requestAbortController.current) {
      // make sure that you are aborting useless requests
      // because it is possible to switch between months pretty quickly
      requestAbortController.current.abort();
    }

    setIsLoading(true);
    setHighlightedDays([]);
    fetchHighlightedDays(date);
  };

  const selectDate = (date: Dayjs, _, dateView: DateView) => {
    if (dateView === 'day' && loadItemsByDate) {
      const year = date.year()
      const month = date.month() + 1
      const day = date.date()

      loadItemsByDate(year, month, day)
    }
  }

  return (
    <div style={{ backgroundColor: 'lightgrey', borderRadius: 20, display: show ? 'block' : 'none' }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          defaultValue={initialValue}
          loading={isLoading}
          onMonthChange={handleMonthChange}
          renderLoading={() => <DayCalendarSkeleton />}
          onChange={selectDate}
          slots={{
            day: ServerDay,
          }}
          slotProps={{ day: { highlightedDays } as any }}
        />
      </LocalizationProvider>
    </div>
  );
}
