import Image from "next/image";

export function DepositButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="btn-primary flex flex-grow items-center justify-center gap-2 md:w-40"
      onClick={onClick}
    >
      <Image src="/plus-icon-white.svg" alt="Add" width={24} height={24} /> Deposit
    </button>
  );
}
