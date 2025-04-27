import tecnaritLogo from "../../assets/tecnarit-logo.png";

export default function MobileHeader() {
  return (
    <div className="flex items-center justify-center border-b border-border bg-card px-4 py-2 lg:hidden">
      <div className="flex-1 flex justify-center items-center h-12 overflow-hidden">
        <img src={tecnaritLogo} alt="TECNARIT" className="h-full w-full object-contain" />
      </div>
    </div>
  );
}
