export default function RegistrationStatusBox({ text, bgcolor, txtcolor }) {
  return (
    <div style={{backgroundColor: bgcolor, color: txtcolor}} className="h-auto w-96 p-5 rounded-lg flex flex-col justify-end shadow-xl relative overflow-hidden">
      <span className="text-right">
       {text}
      </span>
    </div>
  );
}
