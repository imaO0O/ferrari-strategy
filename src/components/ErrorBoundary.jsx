import { Component } from "react";
import EmptyState from "./EmptyState";

/* Глобальная защита от белого экрана: любая ошибка рендера показывает
   аккуратную заглушку. Сбрасывается при смене маршрута (resetKey). */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Ошибка интерфейса:", error, info);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-3xl px-5 pb-24 pt-40">
          <EmptyState
            title="Что-то пошло не так"
            note="Интерфейс споткнулся об ошибку. Обнови страницу — обычно этого достаточно. Если повторяется — сообщи через GitHub Issues (ссылка на странице «О проекте»)."
            actionLabel="Перезагрузить"
            onAction={() => window.location.reload()}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
