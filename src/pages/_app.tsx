import { UnifiedWalletButton, UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';

import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

import AppHeader from 'src/components/AppHeader/AppHeader';
import Footer from 'src/components/Footer/Footer';

import { SolflareWalletAdapter, UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useForm } from 'react-hook-form';
import { IFormConfigurator, INITIAL_FORM_CONFIG, JUPITER_DEFAULT_RPC } from 'src/constants';
import IntegratedTerminal from 'src/content/IntegratedTerminal';
import { IInit } from 'src/types';

const isDevNodeENV = process.env.NODE_ENV === 'development';
const isDeveloping = isDevNodeENV && typeof window !== 'undefined';
// In NextJS preview env settings
const isPreview = Boolean(process.env.NEXT_PUBLIC_IS_NEXT_PREVIEW);
if ((isDeveloping || isPreview) && typeof window !== 'undefined') {
  // Initialize an empty value, simulate webpack IIFE when imported
  (window as any).Jupiter = {};

  // Perform local fetch on development, and next preview
  Promise.all([import('../library'), import('../index')]).then((res) => {
    const [libraryProps, rendererProps] = res;

    (window as any).Jupiter = libraryProps;
    (window as any).JupiterRenderer = rendererProps;
  });
}

export default function App({ Component, pageProps }: AppProps) {
  const [tab, setTab] = useState<IInit['displayMode']>('integrated');

  // Cleanup on tab change
  useEffect(() => {
    if (window.Jupiter._instance) {
      window.Jupiter._instance = null;
    }
  }, [tab]);

  const rpcUrl = useMemo(() => JUPITER_DEFAULT_RPC, []);

  const { watch, reset, setValue, formState } = useForm<IFormConfigurator>({
    defaultValues: INITIAL_FORM_CONFIG,
  });

  const watchAllFields = watch();

  // Solflare wallet adapter comes with Metamask Snaps supports
  const wallets = useMemo(() => [new UnsafeBurnerWalletAdapter(), new SolflareWalletAdapter()], []);

  const ShouldWrapWalletProvider = useMemo(() => {
    return watchAllFields.simulateWalletPassthrough
      ? ({ children }: { children: ReactNode }) => (
          <UnifiedWalletProvider
            wallets={wallets}
            config={{
              env: 'mainnet-beta',
              autoConnect: true,
              metadata: {
                name: 'SolApe Swap',
                description: '',
                url: 'https://solape.io/',
                iconUrls: [''],
              },
              theme: 'jupiter',
            }}
          >
            {children}
          </UnifiedWalletProvider>
        )
      : React.Fragment;
  }, [watchAllFields.simulateWalletPassthrough]);

  return (
    <>
      <DefaultSeo
        title={'SolApe Swap'}
        openGraph={{
          type: 'website',
          locale: 'en',
          title: 'SolApe Swap',
          description: 'SolApe Swap: A lite version of Jupiter that provides end-to-end swap flow.',
          url: 'https://solape.io/',
          site_name: 'SolApe Swap',
          images: [
            {
              url: `https://og.jup.ag/api/jupiter`,
              alt: 'SOL.APE',
            },
          ],
        }}
        twitter={{
          cardType: 'summary_large_image',
          site: 'solape.io',
          handle: '@SolApeDEX',
        }}
      />

      <div className="bg-v3-bg h-screen w-screen max-w-screen overflow-x-hidden flex flex-col justify-between">
        <div>
          <AppHeader />

          <div className="">
            <div className="flex flex-col items-center h-full w-full mt-4 md:mt-14">
              <div className="flex flex-col justify-center items-center text-center">
              </div>
            </div>

            <div className="flex justify-center">
              <div className="max-w-6xl bg-black/25 mt-12 rounded-xl flex flex-col md:flex-row w-full md:p-4 relative">

                <ShouldWrapWalletProvider>
                  <div className="mt-8 md:mt-0 md:ml-4 h-full w-full bg-black/40 rounded-xl flex flex-col">
                    {watchAllFields.simulateWalletPassthrough ? (
                      <div className="absolute right-6 top-8 text-white flex flex-col justify-center text-center">
                        <div className="text-xs mb-1">Simulate dApp Wallet</div>
                        <UnifiedWalletButton />
                      </div>
                    ) : null}

                    <div className="flex flex-grow items-center justify-center text-white/75">
                      {tab === 'integrated' ? (
                        <IntegratedTerminal
                          rpcUrl={rpcUrl}
                          formProps={watchAllFields.formProps}
                          simulateWalletPassthrough={watchAllFields.simulateWalletPassthrough}
                          strictTokenList={watchAllFields.strictTokenList}
                          defaultExplorer={watchAllFields.defaultExplorer}
                        />
                      ) : null}
                    </div>
                  </div>
                </ShouldWrapWalletProvider>
              </div>
            </div>
            {/* Mobile configurator */}
          </div>
        </div>

        <div className="w-full mt-12">
          <Footer />
        </div>
      </div>
    </>
  );
}
