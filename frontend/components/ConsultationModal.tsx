'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, MessageCircle, Sparkles, Send, ArrowRight } from 'lucide-react';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: string;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose, defaultPlan }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('11-сынып');
  const [pair, setPair] = useState('Математика + Физика');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `Сәлеметсіз бе! Zerdeli онлайн академиясынан тегін сынақ сабағын алғым келеді.\nАты-жөнім: ${name || 'Оқушы'}\nСыныбым: ${grade}\nБейіндік пәнім: ${pair}`
    );
    window.open(`https://wa.me/77785947325?text=${text}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg rounded-3xl juz-card border border-juz-500/40 p-6 sm:p-8 shadow-2xl shadow-juz-500/20 space-y-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-140 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% ТЕГІН СЫНАҚ САБАҒЫ</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                ҰБТ Деңгейіңді Анықта!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Өтініш қалдырыңыз — 15 минут ішінде куратор хабарласып, тегін сынақ сабағы мен жеке дайындық жоспарын ұсынады.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                  Аты-жөніңіз:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Мысалы, Арман Серік"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-juz-dark border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder-slate-500 focus:outline-none focus:border-juz-400 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                  WhatsApp телефон нөміріңіз:
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+7 (700) 000-00-00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-juz-dark border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder-slate-500 focus:outline-none focus:border-juz-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                    Сыныбыңыз:
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-slate-100 dark:bg-juz-dark border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-juz-400 transition-all"
                  >
                    <option value="11-сынып">11-сынып (Түлек)</option>
                    <option value="10-сынып">10-сынып</option>
                    <option value="9-сынып">9-сынып (Колледж/Лицей)</option>
                    <option value="NIS/BIL">5-6 сынып (NIS/BIL)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                    Бейіндік жұп:
                  </label>
                  <select
                    value={pair}
                    onChange={(e) => setPair(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-slate-100 dark:bg-juz-dark border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-juz-400 transition-all"
                  >
                    <option value="Математика + Физика">Мат + Физ</option>
                    <option value="Химия + Биология">Хим + Био</option>
                    <option value="География + Математика">Гео + Мат</option>
                    <option value="Тарих + Құқық">Тарих + Құқық</option>
                    <option value="Ағылшын + Тарих">Ағылшын + Тарих</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl juz-btn-primary font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-transform"
              >
                <span>Өтініш жіберу</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Өтінішіңіз сәтті қабылданды! 🎉
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                Рақмет, <strong className="text-slate-900 dark:text-white">{name}</strong>! Куратор сіздің деректеріңізді алды. Кезекті күтпей, WhatsApp арқылы бірден жауап алуға болады:
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleOpenWhatsApp}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp арқылы бірден бастау</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
