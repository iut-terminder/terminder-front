import { toast } from "react-toastify";

export function ShowToast(
  msg: string,
  type: "success" | "error" | "warning" | "info"
) {
  toast(msg, {
    type: type,
    style: {
      fontFamily: "IranYekan",
      textAlign: "start",
      direction: "rtl",
      fontSize: "20px",
    },
  });
}
