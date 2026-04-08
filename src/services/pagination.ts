import type { ListQueryParams, PaginatedListData, PaginationData } from '../types'

const DEFAULT_PAGE = 1
const DEFAULT_LENGTH = 10
const MAX_LENGTH = 100

type GenericRecord = Record<string, unknown>
type QueryValue = string | number | boolean | null | undefined

export interface NormalizedListResult<T> extends PaginatedListData<T> {
  isPaginated: boolean
}

function asRecord(value: unknown): GenericRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as GenericRecord
}

function toInteger(
  value: unknown,
  fallback: number,
  options?: { min?: number; max?: number },
): number {
  const rawNumber =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : Number.NaN

  if (!Number.isFinite(rawNumber)) {
    return fallback
  }

  const normalized = Math.floor(rawNumber)
  const min = options?.min ?? Number.NEGATIVE_INFINITY
  const max = options?.max ?? Number.POSITIVE_INFINITY

  return Math.min(Math.max(normalized, min), max)
}

function createFallbackPagination(page: number, length: number, total: number): PaginationData {
  const totalPages = total > 0 ? Math.ceil(total / length) : 1

  return {
    page,
    length,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

function normalizeItems<T>(
  value: unknown,
  mapItem?: (value: unknown) => T | null,
): T[] {
  if (!Array.isArray(value)) {
    return []
  }

  if (!mapItem) {
    return value as T[]
  }

  return value
    .map((item) => mapItem(item))
    .filter((item): item is T => item !== null)
}

export function isPaginationRequested(params?: ListQueryParams): boolean {
  return Boolean(params && (typeof params.page === 'number' || typeof params.length === 'number'))
}

export function normalizeListQueryParams(params?: ListQueryParams): Required<ListQueryParams> {
  const normalizedSearch = params?.search?.trim() ?? ''

  return {
    search: normalizedSearch,
    page: toInteger(params?.page, DEFAULT_PAGE, { min: 1 }),
    length: toInteger(params?.length, DEFAULT_LENGTH, { min: 1, max: MAX_LENGTH }),
  }
}

export function buildListQueryString(
  params: Required<ListQueryParams>,
  extraParams: Record<string, QueryValue> = {},
): string {
  const searchParams = new URLSearchParams()

  if (params.search) {
    searchParams.set('search', params.search)
  }

  searchParams.set('page', String(params.page))
  searchParams.set('length', String(params.length))

  Object.entries(extraParams).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null) {
      return
    }

    if (typeof rawValue === 'string') {
      const normalizedValue = rawValue.trim()
      if (!normalizedValue || normalizedValue.toLowerCase() === 'all') {
        return
      }
      searchParams.set(key, normalizedValue)
      return
    }

    searchParams.set(key, String(rawValue))
  })

  return searchParams.toString()
}

export function normalizeLegacyOrPaginatedListData<T>(
  rawData: unknown,
  fallbackParams: Required<ListQueryParams>,
  mapItem?: (value: unknown) => T | null,
): NormalizedListResult<T> {
  if (Array.isArray(rawData)) {
    const items = normalizeItems<T>(rawData, mapItem)
    return {
      items,
      pagination: createFallbackPagination(fallbackParams.page, fallbackParams.length, items.length),
      isPaginated: false,
    }
  }

  const dataRecord = asRecord(rawData)
  const itemsRaw = dataRecord?.items
  const paginationRecord = asRecord(dataRecord?.pagination)
  const items = normalizeItems<T>(itemsRaw, mapItem)
  const fallbackPagination = createFallbackPagination(
    fallbackParams.page,
    fallbackParams.length,
    items.length,
  )

  if (!paginationRecord) {
    return {
      items,
      pagination: fallbackPagination,
      isPaginated: false,
    }
  }

  const page = toInteger(paginationRecord.page, fallbackPagination.page, { min: 1 })
  const length = toInteger(paginationRecord.length, fallbackPagination.length, {
    min: 1,
    max: MAX_LENGTH,
  })
  const total = toInteger(paginationRecord.total, fallbackPagination.total, { min: 0 })
  const totalPages = toInteger(paginationRecord.totalPages, fallbackPagination.totalPages, { min: 1 })
  const hasNextPage =
    typeof paginationRecord.hasNextPage === 'boolean'
      ? paginationRecord.hasNextPage
      : page < totalPages
  const hasPrevPage =
    typeof paginationRecord.hasPrevPage === 'boolean'
      ? paginationRecord.hasPrevPage
      : page > 1

  return {
    items,
    pagination: {
      page,
      length,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
    isPaginated: true,
  }
}

export function normalizePaginatedListData<T>(
  rawData: unknown,
  fallbackParams: Required<ListQueryParams>,
  mapItem?: (value: unknown) => T | null,
): PaginatedListData<T> {
  const normalized = normalizeLegacyOrPaginatedListData(rawData, fallbackParams, mapItem)
  return {
    items: normalized.items,
    pagination: normalized.pagination,
  }
}
