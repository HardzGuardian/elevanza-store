'use client';

import { CldImage, CldImageProps } from 'next-cloudinary';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@/core/utils';

interface OptimizedImageProps extends Omit<CldImageProps, 'src'> {
  src: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
}

function ImagePlaceholder({ fill, className }: { fill?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        'bg-neutral-100 flex items-center justify-center',
        fill ? 'absolute inset-0' : 'w-full h-full',
        className
      )}
    >
      <ImageOff className="w-5 h-5 text-neutral-300" strokeWidth={1.5} />
    </div>
  );
}

export function OptimizedImage({ src, className, fill, priority, ...props }: OptimizedImageProps) {
  if (!src) return <ImagePlaceholder fill={fill} className={className} />;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const isCloudinaryConfigured = cloudName && cloudName !== 'your-cloud-name';

  const isExternalUrl = src.startsWith('http') || src.startsWith('https');
  const isCloudinaryUrl = isExternalUrl && src.includes('res.cloudinary.com');

  if (!isCloudinaryConfigured || (isExternalUrl && !isCloudinaryUrl)) {
    return (
      <div className={cn('relative overflow-hidden', fill ? 'h-full w-full' : '', className)}>
        <Image
          src={src}
          alt={props.alt || 'Image'}
          fill={fill}
          priority={priority}
          className={cn(
            'duration-700 ease-in-out transition-all',
            fill ? 'object-cover' : '',
            props.className
          )}
          {...(props as any)}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', fill ? 'h-full w-full' : '', className)}>
      <CldImage
        src={src}
        fill={fill}
        loading={props.priority ? undefined : 'lazy'}
        dpr="auto"
        format="auto"
        quality="auto"
        crop="fill"
        gravity="auto"
        alt={props.alt || 'Image'}
        {...props}
        className={cn(
          'duration-700 ease-in-out transition-all',
          fill ? 'object-cover' : '',
          props.className
        )}
      />
    </div>
  );
}
