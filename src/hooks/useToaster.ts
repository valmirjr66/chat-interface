import { useCallback } from "react";
import { toast, TypeOptions } from "react-toastify";

interface UseToasterProps {
  messageContent: string;
  type: TypeOptions
}

export default function useToaster({ messageContent, type }: UseToasterProps) {
  const triggerToast = useCallback(() => {
    toast(messageContent, {
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
  }, [messageContent, type]);

  return { triggerToast };
}