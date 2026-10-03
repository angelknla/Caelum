'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
    return (
        <section>
            <h1>Something went wrong</h1>
            <button type="button" onClick={reset}>Try again</button>
        </section>
    );
}