/** A package the download offers. */
export interface DownloadPackage {
  key: 'full' | 'update';
  /** Shown as is, e.g. "4.69 GB"; its leading figure rolls on drums and lights message signs. */
  size: string;
  href: string;
  /** Sets the link's download attribute when given. */
  file?: string;
  title?: string;
  /** A few words for the designs with little room ("First install"). */
  short?: string;
  blurb?: string;
}

/** A note under the choices; `tone` is a .b5-status tone (success, warning, danger). */
export interface DownloadNote {
  tone?: string;
  label?: string;
  text: string;
}

/** What every design reads; only `full` is required. */
export interface DownloadData {
  number?: string | number;
  commit?: string;
  /** "3h ago": updated in place by update(). */
  age?: string;
  /** Updated in place by update(). */
  count?: number;
  /** Defaults to "Paradise City". */
  place?: string;
  /** The site's host, embossed on some plates. */
  site?: string;
  /** A three-letter month for the plates' corner box. */
  month?: string;
  /** Defaults to "PC". */
  platform?: string;
  /** The build a pasted-over poster covers; defaults to number - 1. */
  previous?: string | number;
  full?: Omit<DownloadPackage, 'key'>;
  update?: Omit<DownloadPackage, 'key'> | null;
  /** Defaults to "Assets unchanged"; null shows none. */
  note?: DownloadNote | null;
}

export interface DownloadDesign {
  id: string;
  group: 'Bar' | 'Road sign' | 'Licence plate' | 'Billboard';
  code: string;
  label: string;
  note: string;
  /** Whether the bar's data-skin treatments apply. */
  skins: boolean;
  markup(prefix: string, data: ReturnType<typeof downloadData>, options?: { dialog?: string }): string;
}

export interface DownloadChooserController {
  readonly element: HTMLButtonElement;
  readonly opened: boolean;
  open(options?: { focus?: 'first' | 'last' | false }): void;
  close(options?: { restoreFocus?: boolean }): void;
  destroy(): void;
}

export interface DownloadDesignController {
  readonly element: HTMLButtonElement | null;
  readonly design: string;
  readonly opened: boolean;
  open(options?: { focus?: 'first' | 'last' | false }): void;
  close(options?: { restoreFocus?: boolean }): void;
  /** A new build redraws the design; a new count, age or note changes in place. */
  update(data: DownloadData): void;
  setNote(note: DownloadNote | null): void;
  destroy(): void;
}

export const downloadDesigns: DownloadDesign[];
export const sampleDownload: DownloadData;
export function downloadData(data?: DownloadData): Required<Omit<DownloadData, 'full' | 'update' | 'note'>> & {
  full: DownloadPackage; update: DownloadPackage | null; packages: DownloadPackage[]; note: DownloadNote | null;
};
export function renderDownloadDesign(slot: HTMLElement, design: string, options?: {
  prefix?: string;
  data?: DownloadData;
  dialog?: string;
  onChoose?(item: DownloadPackage, event: MouseEvent): void;
  onPreview?(event: MouseEvent): void;
}): DownloadDesignController;
export function createDownloadChooser(root: HTMLElement): DownloadChooserController;
export function mountDownloadChoosers(scope?: ParentNode): { controllers: DownloadChooserController[]; destroy(): void };
