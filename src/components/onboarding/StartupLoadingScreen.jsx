import loadingMascot from "../../assets/mascot/loading-dark.png";

export default function StartupLoadingScreen() {
  return (
    <main
      className="startup-loading-screen"
      aria-busy="true"
      aria-label="Загрузка приложения"
    >
      <div className="startup-loading-visual" aria-hidden="true">
        <img
          className="startup-loading-mascot"
          src={loadingMascot}
          alt=""
        />
      </div>
    </main>
  );
}
