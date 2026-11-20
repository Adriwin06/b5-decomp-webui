export interface Page<T> {
  items: T[];
  page: number;
  pageCount: number;
  total: number;
  from: number;
  to: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
export function paginate<T>(items: T[], options?: { page?: number; pageSize?: number }): Page<T>;
export interface TabsController {
  readonly selectedIndex: number;
  select(index: number, options?: { focus?: boolean; emit?: boolean }): boolean;
  destroy(): void;
}
export function createTabs(container: HTMLElement): TabsController;
export interface SelectController {
  readonly element: HTMLButtonElement;
  open(): void;
  close(options?: { commit?: boolean }): void;
  refresh(): void;
  destroy(): void;
}
export function createSelect(select: HTMLSelectElement): SelectController;
export interface DownloadMenuController {
  readonly element: HTMLButtonElement;
  readonly opened: boolean;
  open(options?: { focus?: false | 'first' | 'last' }): void;
  close(options?: { restoreFocus?: boolean }): void;
  destroy(): void;
}
export function createDownloadMenu(container: HTMLElement): DownloadMenuController;
export function createFilterGroup(container: HTMLElement): {
  readonly value: string;
  select(value: string, options?: { focus?: boolean; emit?: boolean }): boolean;
  destroy(): void;
};
export function setProgress(element: HTMLElement, value: number, options?: { max?: number }): number;
export function renderSparkline(element: HTMLElement, values: number[], options?: { label?: string }): void;
export interface PagerState { page: number; pageCount: number; pageSize: number; total: number; from: number; to: number; }
export function createPager(container: HTMLElement, options?: { page?: number; pageSize?: number; total?: number; unit?: string; locale?: string }): {
  readonly state: Readonly<PagerState>;
  set(options: { page?: number; pageSize?: number; total?: number }, behavior?: { emit?: boolean }): Readonly<PagerState>;
  destroy(): void;
};
export function openDialog(dialog: HTMLDialogElement, options?: { trigger?: HTMLElement }): void;
export function closeDialog(dialog: HTMLDialogElement, returnValue?: string): void;
export type Tone = 'info' | 'success' | 'warning' | 'danger';
export function notify(message: string, options?: {
  tone?: Tone;
  duration?: number;
  root?: Document | HTMLElement;
}): { element: HTMLDivElement; dismiss(): void };
export function enhance(root?: Document | HTMLElement): { refresh(): void; destroy(): void };
