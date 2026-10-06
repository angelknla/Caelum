import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ScrollHeader from './ScrollHeader';

beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(80);
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(2000);
    vi.stubGlobal('scrollY', 0);
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

function scrollTo(top: number) {
    vi.stubGlobal('scrollY', top);
    fireEvent.scroll(window);
}

it('hides below its height and reappears when scrolling upward', () => {
    render(
        <ScrollHeader>
            <a href="/">Caelum</a>
        </ScrollHeader>
    );
    const header = screen.getByRole('banner');
    expect(header).toHaveAttribute('data-hidden', 'false');
    scrollTo(60);
    expect(header).toHaveAttribute('data-hidden', 'false');
    scrollTo(160);
    expect(header).toHaveAttribute('data-hidden', 'true');
    scrollTo(158);
    expect(header).toHaveAttribute('data-hidden', 'true');
    scrollTo(150);
    expect(header).toHaveAttribute('data-hidden', 'false');
    scrollTo(200);
    expect(header).toHaveAttribute('data-hidden', 'true');
    scrollTo(0);
    expect(header).toHaveAttribute('data-hidden', 'false');
});

it('ignores small direction changes and bottom overscroll', () => {
    render(<ScrollHeader>Caelum</ScrollHeader>);
    const header = screen.getByRole('banner');
    scrollTo(200);
    scrollTo(197);
    scrollTo(201);
    expect(header).toHaveAttribute('data-hidden', 'true');
    scrollTo(2000);
    scrollTo(1900);
    expect(header).toHaveAttribute('data-hidden', 'true');
});
