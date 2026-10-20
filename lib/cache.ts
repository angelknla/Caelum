/** A bounded LRU cache. Failed loads are retried; invalidation also drops pending loads. */
export class BoundedCache<Value> {
  private entries = new Map<string, { value: Value; expires: number }>();
  private pending = new Map<string, Promise<Value>>();

  constructor(
    private readonly capacity: number,
    private readonly ttl: number
  ) {}

  private get(key: string): { value: Value } | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    this.entries.delete(key);
    if (entry.expires <= Date.now()) return undefined;
    this.entries.set(key, entry);
    return entry;
  }

  private set(key: string, value: Value) {
    if (this.ttl <= 0) return;
    this.entries.delete(key);
    this.entries.set(key, { value, expires: Date.now() + this.ttl });
    while (this.entries.size > this.capacity)
      this.entries.delete(this.entries.keys().next().value!);
  }

  getOrCreate(key: string, create: () => Value): Value {
    const entry = this.get(key);
    if (entry) return entry.value;
    const value = create();
    this.set(key, value);
    return value;
  }

  getOrLoad(key: string, load: () => Promise<Value>): Promise<Value> {
    const entry = this.get(key);
    if (entry) return Promise.resolve(entry.value);
    const pending = this.pending.get(key);
    if (pending) return pending;
    // Cap pending work too, without evicting a load another caller is awaiting.
    if (this.pending.size >= this.capacity) return load();
    const promise = Promise.resolve()
      .then(load)
      .then((value) => {
        if (this.pending.get(key) === promise) this.set(key, value);
        return value;
      })
      .finally(() => {
        if (this.pending.get(key) === promise) this.pending.delete(key);
      });
    this.pending.set(key, promise);
    return promise;
  }

  invalidate(prefix: string) {
    for (const key of this.entries.keys()) if (key.startsWith(prefix)) this.entries.delete(key);
    for (const key of this.pending.keys()) if (key.startsWith(prefix)) this.pending.delete(key);
  }
}
