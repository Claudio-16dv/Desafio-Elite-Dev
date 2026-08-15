'use client';

import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { Button } from '@/shared/ui';

const itemTransition = (delay: number) => ({
  duration: 0.55,
  delay,
  ease: 'easeOut' as const,
});

export function Hero() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? false : { opacity: 0, y: 20 };
  const animate = reduceMotion ? undefined : { opacity: 1, y: 0 };

  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,_rgba(139,92,246,0.37),_transparent_28%),radial-gradient(circle_at_82%_30%,_rgba(236,72,153,0.3),_transparent_24%),radial-gradient(circle_at_52%_94%,_rgba(99,102,241,0.18),_transparent_28%)]"
        animate={reduceMotion ? undefined : { backgroundPosition: ['0% 0%', '100% 60%', '0% 0%'] }}
        transition={
          reduceMotion ? undefined : { duration: 16, repeat: Infinity, ease: 'easeInOut' }
        }
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <motion.p
          initial={initial}
          animate={animate}
          transition={itemTransition(0)}
          className="text-xs font-semibold uppercase tracking-[0.24em] text-accent"
        >
          A próxima cena é sua
        </motion.p>
        <motion.h1
          initial={initial}
          animate={animate}
          transition={itemTransition(0.12)}
          className="mt-5 max-w-4xl font-display text-5xl font-bold tracking-tight sm:text-7xl"
        >
          Eventos que continuam com você depois do aplauso.
        </motion.h1>
        <motion.p
          initial={initial}
          animate={animate}
          transition={itemTransition(0.24)}
          className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground"
        >
          Descubra experiências ao vivo, escolha seu lugar e entre em cena com um ingresso seguro.
        </motion.p>
        <motion.div
          initial={initial}
          animate={animate}
          transition={itemTransition(0.36)}
          className="mt-9 flex flex-wrap gap-3"
        >
          <Button asChild size="lg">
            <Link href="/events">
              Ver eventos
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
