export type StudentPreferenceState = {
  favoriteModules: string[];
  favoriteLessons: string[];
};

export type StudentLearningState = {
  lastModuleId?: string | null;
  lastLessonId?: string | null;
  lastLessonTitle?: string | null;
  lastRoute?: string | null;
  lastVisitedUtc?: string | null;
};

const STORAGE_KEY = "cognispark.student.preferences.v1";
const LEARNING_STATE_STORAGE_KEY = "cognispark.student.learning-state.v1";

function uniqueIds(values: string[]): string[] {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

export function defaultStudentPreferenceState(): StudentPreferenceState {
  return {
    favoriteModules: [],
    favoriteLessons: [],
  };
}

export function normalizeStudentPreferenceState(payload: unknown): StudentPreferenceState {
  if (!payload || typeof payload !== "object") {
    return defaultStudentPreferenceState();
  }

  const record = payload as Record<string, unknown>;
  return {
    favoriteModules: Array.isArray(record.favoriteModules)
      ? uniqueIds(record.favoriteModules.filter((value): value is string => typeof value === "string"))
      : Array.isArray(record.favorite_modules)
        ? uniqueIds(record.favorite_modules.filter((value): value is string => typeof value === "string"))
      : [],
    favoriteLessons: Array.isArray(record.favoriteLessons)
      ? uniqueIds(record.favoriteLessons.filter((value): value is string => typeof value === "string"))
      : Array.isArray(record.favorite_lessons)
        ? uniqueIds(record.favorite_lessons.filter((value): value is string => typeof value === "string"))
      : [],
  };
}

export function mergeStudentPreferenceStates(
  primaryState: StudentPreferenceState,
  secondaryState: StudentPreferenceState,
): StudentPreferenceState {
  return {
    favoriteModules: uniqueIds([
      ...primaryState.favoriteModules,
      ...secondaryState.favoriteModules,
    ]),
    favoriteLessons: uniqueIds([
      ...primaryState.favoriteLessons,
      ...secondaryState.favoriteLessons,
    ]),
  };
}

function normalizeRoute(value: unknown): string | null {
  const route = String(value || "").trim();
  if (!route || !route.startsWith("/student")) {
    return null;
  }
  return route;
}

export function normalizeStudentLearningState(payload: unknown): StudentLearningState | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const normalized: StudentLearningState = {
    lastModuleId:
      typeof record.lastModuleId === "string"
        ? record.lastModuleId.trim() || null
        : typeof record.last_module_id === "string"
          ? record.last_module_id.trim() || null
          : null,
    lastLessonId:
      typeof record.lastLessonId === "string"
        ? record.lastLessonId.trim() || null
        : typeof record.last_lesson_id === "string"
          ? record.last_lesson_id.trim() || null
          : null,
    lastLessonTitle:
      typeof record.lastLessonTitle === "string"
        ? record.lastLessonTitle.trim() || null
        : typeof record.last_lesson_title === "string"
          ? record.last_lesson_title.trim() || null
          : null,
    lastRoute: normalizeRoute(record.lastRoute ?? record.last_route),
    lastVisitedUtc:
      typeof record.lastVisitedUtc === "string"
        ? record.lastVisitedUtc.trim() || null
        : typeof record.last_visited_utc === "string"
          ? record.last_visited_utc.trim() || null
          : null,
  };

  if (!normalized.lastModuleId && !normalized.lastLessonId && !normalized.lastRoute) {
    return null;
  }

  return normalized;
}

export function readStudentPreferenceState(): StudentPreferenceState {
  if (typeof window === "undefined") {
    return defaultStudentPreferenceState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultStudentPreferenceState();
    }

    return normalizeStudentPreferenceState(JSON.parse(raw));
  } catch {
    return defaultStudentPreferenceState();
  }
}

export function writeStudentPreferenceState(nextState: StudentPreferenceState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeStudentPreferenceState(nextState)));
}

export function readStudentLearningState(): StudentLearningState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LEARNING_STATE_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return normalizeStudentLearningState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeStudentLearningState(nextState: StudentLearningState | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!nextState) {
    window.localStorage.removeItem(LEARNING_STATE_STORAGE_KEY);
    return;
  }

  const normalizedState = normalizeStudentLearningState(nextState);
  if (!normalizedState) {
    window.localStorage.removeItem(LEARNING_STATE_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(LEARNING_STATE_STORAGE_KEY, JSON.stringify(normalizedState));
}

export function togglePreferenceId(currentIds: string[], id: string): string[] {
  const normalizedId = String(id || "").trim();
  if (!normalizedId) {
    return uniqueIds(currentIds);
  }

  const nextIds = uniqueIds(currentIds);
  return nextIds.includes(normalizedId)
    ? nextIds.filter((value) => value !== normalizedId)
    : [...nextIds, normalizedId];
}

export function moduleFavoriteKey(moduleId?: string | null): string {
  return `module:${String(moduleId || "").trim().toUpperCase()}`;
}

export function lessonFavoriteKey(moduleId?: string | null, lessonId?: string | null): string {
  return `lesson:${String(moduleId || "").trim().toUpperCase()}:${String(lessonId || "").trim().toUpperCase()}`;
}

export function serializeStudentPreferenceState(state: StudentPreferenceState): {
  favorite_modules: string[];
  favorite_lessons: string[];
} {
  const normalizedState = normalizeStudentPreferenceState(state);
  return {
    favorite_modules: normalizedState.favoriteModules,
    favorite_lessons: normalizedState.favoriteLessons,
  };
}

export function serializeStudentLearningState(state: StudentLearningState | null): {
  last_module_id?: string | null;
  last_lesson_id?: string | null;
  last_lesson_title?: string | null;
  last_route?: string | null;
} {
  const normalizedState = normalizeStudentLearningState(state);
  return {
    last_module_id: normalizedState?.lastModuleId || null,
    last_lesson_id: normalizedState?.lastLessonId || null,
    last_lesson_title: normalizedState?.lastLessonTitle || null,
    last_route: normalizedState?.lastRoute || null,
  };
}
