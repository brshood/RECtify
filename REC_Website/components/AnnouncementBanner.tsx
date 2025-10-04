import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RotatingText from './RotatingText';

interface AnnouncementBannerProps {
  onClose?: () => void;
}

export function AnnouncementBanner({ onClose }: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // Removed auto-hide functionality - section stays visible

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
          className="relative w-full min-h-screen flex items-center justify-center py-16"
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
              className="flex justify-center"
            >
              <div className="w-full flex items-center justify-center">
                <div className="relative bg-gradient-to-br from-emerald-50/90 via-cyan-50/80 to-blue-50/90 backdrop-blur-sm rounded-3xl border border-emerald-200/50 shadow-2xl shadow-emerald-500/20 p-8 md:p-16 max-w-7xl mx-6 min-h-[300px] md:min-h-[400px] lg:min-h-[500px] flex items-center">
                  {/* Subtle accent border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-cyan-400/20 to-blue-400/20 rounded-3xl blur-xl"></div>
                  
                  <div className="relative text-4xl md:text-6xl lg:text-8xl font-bold leading-tight text-center text-gray-800 dark:text-gray-100 w-full">
                    <RotatingText
                      texts={[
                        { 
                          text: 'نُسهّل رحلتك الكربونية — من التقرير إلى التخفيض',
                          highlights: {
                            'الكربونية': 'text-blue-600 font-extrabold',
                            'التخفيض': 'text-emerald-600 font-extrabold'
                          }
                        },
                        { 
                          text: 'Streamlining the entire carbon journey — from reporting to Net Zero',
                          highlights: {
                            'carbon journey': 'text-blue-600 font-extrabold',
                            'Net': 'text-emerald-600 font-extrabold',
                            'Zero': 'text-emerald-600 font-extrabold'
                          }
                        }
                      ]}
                      mainClassName="overflow-hidden justify-center items-center flex text-center"
                      splitBy="words"
                      staggerFrom={"last"}
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "-120%" }}
                      staggerDuration={0.05}
                      splitLevelClassName="overflow-hidden pb-1 md:pb-2"
                      transition={{ type: "spring", damping: 40, stiffness: 600 }}
                      rotationInterval={6000}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
