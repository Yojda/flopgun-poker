export default function Loading() {
  return (
    <div
      className="bg-fixed bg-cover flex bg-center items-center justify-center w-screen min-h-screen"
      style={{ backgroundImage: "url('/images/bg2.png')" }}
    >
      <div className="text-white text-xl animate-pulse">Chargement du problème...</div>
    </div>
  );
} 