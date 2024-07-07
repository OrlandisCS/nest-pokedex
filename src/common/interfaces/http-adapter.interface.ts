export interface HttpAdater {
  get<T>(url: string): Promise<T>;
}
