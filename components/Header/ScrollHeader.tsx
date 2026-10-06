'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import styles from './Header.module.css';

export default function ScrollHeader({ children }: { children: ReactNode }) {
    const headerRef = useRef<HTMLElement>(null);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        let previousY = Math.max(0, window.scrollY);
        let distance = 0;
        let previousDirection = 0;

        function onScroll() {
            const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            const currentY = Math.min(maxY, Math.max(0, window.scrollY));
            const delta = currentY - previousY;
            const direction = Math.sign(delta);
            previousY = currentY;

            if (direction !== previousDirection) distance = 0;
            distance += delta;
            previousDirection = direction;

            if (currentY <= (headerRef.current?.offsetHeight ?? 0)) {
                setHidden(false);
            } else if (Math.abs(distance) >= 8) {
                setHidden(direction > 0);
                distance = 0;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header ref={headerRef} className={styles.header} data-hidden={hidden}>
            {children}
        </header>
    );
}
