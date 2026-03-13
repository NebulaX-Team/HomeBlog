import Link from 'next/link';
import type { CSSProperties } from 'react';
import { siteConfig } from '../../../site.config';
import { QuoteCard, TimeCard } from '@homeblog/ui/client';
import { Github, Mail } from 'lucide-react';

export default function HomePage() {
  const profile = siteConfig.home?.profile ?? {
    name: 'HomeBlog',
    handle: 'home',
    avatarText: 'H',
    avatarUrl: '',
    bio: '记录与整理。',
    socials: []
  };
  const iconMap = {
    mail: Mail,
    email: Mail,
    github: Github
  } as const;
  const radius = siteConfig.home?.radius ?? 18;
  const radiusSm = Math.max(0, radius - 6);
  const radiusLg = radius + 4;

  return (
    <main
      className="page page--hub"
      style={
        {
          '--hub-radius': `${radius}px`,
          '--hub-radius-sm': `${radiusSm}px`,
          '--hub-radius-lg': `${radiusLg}px`
        } as CSSProperties
      }
    >
      <section className="hub-layout">
        <div className="hub-left">
          <div className="hub-profile">
            <div className="hub-profile__avatar">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt={profile.name} />
              ) : (
                profile.avatarText
              )}
            </div>
            <div className="hub-profile__name">{profile.name}</div>
            <div className="hub-profile__handle">@{profile.handle}</div>
            {profile.bio ? <p className="hub-profile__bio">{profile.bio}</p> : null}
            {profile.socials && profile.socials.length ? (
              <div className="hub-profile__socials">
                {profile.socials.map((social) => {
                  const key = (social.icon ?? social.label).toLowerCase();
                  const Icon = iconMap[key as keyof typeof iconMap];
                  return (
                    <a key={social.label} className="social-button" href={social.href}>
                      {Icon ? <Icon size={14} strokeWidth={1.8} /> : null}
                      <span>{social.label}</span>
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="hub-right">
          <div className="hub-top">
            <TimeCard />
            {siteConfig.home?.quoteCard ? (
              <QuoteCard
                apiUrl={siteConfig.home.quoteCard.apiUrl}
                loadingText={siteConfig.home.quoteCard.loadingText}
                loadingAuthor={siteConfig.home.quoteCard.loadingAuthor}
                errorText={siteConfig.home.quoteCard.errorText}
                errorAuthor={siteConfig.home.quoteCard.errorAuthor}
              />
            ) : null}
          </div>
          <div className="hub-nav">
            <div className="section__title">
              <h2>内容导航</h2>
            </div>
            <div className="nav-grid">
              {(siteConfig.home?.navCards ?? []).map((card) => {
                const disabled = !card.href;
                const className = [
                  'nav-card',
                  card.variant === 'primary' ? 'nav-card--primary' : '',
                  disabled ? 'nav-card--disabled' : ''
                ]
                  .filter(Boolean)
                  .join(' ');

                const content = (
                  <>
                    <div className="nav-card__title">{card.title}</div>
                    <p className="muted">{card.description}</p>
                  </>
                );

                if (disabled) {
                  return (
                    <div key={card.title} className={className}>
                      {content}
                    </div>
                  );
                }

                return (
                  <Link key={card.title} className={className} href={card.href ?? '#'}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
