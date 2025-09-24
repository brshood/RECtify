import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnnouncementBannerProps {
  onClose?: () => void;
}

export function AnnouncementBanner({ onClose }: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Auto-hide after 12 seconds
    const hideTimer = setTimeout(() => {
      handleClose();
    }, 12000);

    return () => {
      clearTimeout(hideTimer);
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ 
            opacity: isClosing ? 0 : 1, 
            y: isClosing ? -20 : 0,
            scale: isClosing ? 0.98 : 1
          }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ 
            type: "spring", 
            stiffness: 80, 
            damping: 25,
            duration: isClosing ? 1.0 : 1.2 
          }}
          className="relative w-full py-8"
        >
          {/* Top transition blend - creates seamless connection with hero section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#00FFAF78] to-[#00FFAF40]"
          />
          {/* Main background with flowing gradient - blends with hero section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute inset-0 bg-gradient-to-b from-[#00FFAF40] via-emerald-100/60 to-teal-50/70 backdrop-blur-sm"
          />
          
          {/* Secondary gradient overlay for smooth transition */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/40 to-cyan-50/50"
          />
          
          {/* Accent gradient for depth and continuity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.4, duration: 1.2 }}
            className="absolute inset-0 bg-gradient-to-r from-[#00FFAF20] via-emerald-100/30 to-teal-100/40"
          />
          
          {/* Subtle shimmer effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 0.2, 
              scale: 1,
              backgroundPosition: ['0% 0%', '100% 100%']
            }}
            transition={{ 
              delay: 0.5, 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_200%]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative z-10 text-center mx-auto px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-4"
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-700 leading-relaxed"
              >
                Streamlining the entire{' '}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="font-semibold text-emerald-600"
                >
                  carbon journey
                </motion.span>
                {' '}— from{' '}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="font-semibold text-teal-600"
                >
                  reporting
                </motion.span>
                {' '}to{' '}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="font-semibold text-cyan-600"
                >
                  Net Zero
                </motion.span>
                .
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.8 }}
                className="text-xl md:text-2xl lg:text-3xl font-light text-gray-600 leading-relaxed"
                dir="rtl"
              >
                نُسهّل رحلتك الكربونية — من{' '}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                  className="font-semibold text-emerald-600"
                >
                  التقرير
                </motion.span>
                {' '}إلى{' '}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2, duration: 0.6 }}
                  className="font-semibold text-cyan-600"
                >
                  التخفيض
                </motion.span>
                .
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
