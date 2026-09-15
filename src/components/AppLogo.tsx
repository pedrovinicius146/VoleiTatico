import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative shrink-0 ${sizeMap[size]} transition-transform duration-200 hover:scale-105 drop-shadow-md`}>
        <img
          src="/logo.svg"
          alt="Logotipo Oficial REDE VÔLEI"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white">
              REDE <span className="text-yellow-400">VÔLEI</span>
            </span>
          </div>
          <span className="text-[9px] font-bold text-sky-200 tracking-widest uppercase">
            Simulador & Prancheta Tática
          </span>
        </div>
      )}
    </div>
  );
};
