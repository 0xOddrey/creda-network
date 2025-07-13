export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="btn-primary mt-8 w-full"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
