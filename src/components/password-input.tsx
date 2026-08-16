import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Input password dengan tombol lihat/sembunyikan (standar industri). */
export function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  required,
  minLength,
  autoComplete,
  name,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  name?: string;
  id?: string;
}) {
  const [show, setShow] = useState(false);
  const fallbackId = useId();
  const inputId = id ?? fallbackId;

  return (
    <div className="relative">
      <input
        id={inputId}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="input pr-11"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
        aria-pressed={show}
        aria-controls={inputId}
        title={show ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
