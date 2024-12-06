import { useCallback } from "react";
import { toast, TypeOptions } from "react-toastify";

interface UseToasterProps {
  defaultMessage?: string;
  type: TypeOptions
}

export default function useToaster({
  type,
  defaultMessage = "Something wen't wrong, please try again 😟",
}: UseToasterProps) {
  const triggerToast = useCallback((message?: string) => {
    toast(message || defaultMessage, {
      position: "top-right",
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      type,
    });
  }, [defaultMessage, type]);

  return { triggerToast };
}