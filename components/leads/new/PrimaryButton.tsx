import { ButtonHTMLAttributes } from 'react';

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  return (
    <button
      {...rest}
      className={`min-h-12 rounded-xl bg-[#6B4F3A] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ''}`}
    />
  );
}
