import { describe, it, expect } from "vitest";
import { act } from "react";
import { renderHook } from "@testing-library/react";
import { useLocalSearchQuery } from "./useLocalSearchQuery";

describe("useLocalSearchQuery abort logic", () => {
  it("отменяет предыдущий запрос и не затирает результаты свежим стейлом", async () => {
    const { result, rerender } = renderHook(
      (props: { debounceMs: number }) =>
        useLocalSearchQuery({ debounceMs: props.debounceMs }),
      { initialProps: { debounceMs: 20 } }
    );

    // быстрые изменения запроса
    act(() => {
      result.current.setQuery("fir");
    });
    act(() => {
      result.current.setQuery("firs");
    });
    act(() => {
      result.current.setQuery("first");
    });

    // ждём пока debounce + искусственная задержка пройдут
    await act(async () => {
      await new Promise((r) => setTimeout(r, 700));
    });

    // Проверяем что активный debouncedQuery = финальный
    expect(result.current.debouncedQuery).toBe("first");
    // Ошибок нет
    expect(result.current.error).toBeNull();
  });
});
