import React, { useState, useEffect } from 'react';
import { User, UserRank, AppSettings } from '../types';
import { 
  Medal, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Trophy, 
  X, 
  ArrowUpCircle, 
  ArrowDownToLine,
  ChevronLeft, 
  CircleHelp,
  Info,
  Check,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { compressImage, uploadToImgBB } from '../utils';
import { BANK_BINS } from '../constants';

interface RankLimitsProps {
  user: User | null;
  isGlobalProcessing: boolean;
  onBack: () => void;
  onUpgrade: (targetRank: UserRank, bill: string) => Promise<void> | void;
  onPayOSUpgrade: (rank: string, amount: number) => Promise<void> | void;
  settings: AppSettings;
}

enum RankView {
  LIST = 'LIST',
  PAYMENT = 'PAYMENT'
}

const RankLimits: React.FC<RankLimitsProps> = ({ user, isGlobalProcessing, onBack, onUpgrade, onPayOSUpgrade, settings }) => {
  const [view, setView] = useState<RankView>(RankView.LIST);
  const [selectedRank, setSelectedRank] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  const ranks = [
    {
      id: 'standard',
      name: 'TIÊU CHUẨN',
      code: 'TIEUCHUAN',
      min: '1.000.000 đ',
      max: '2.000.000 đ',
      limitVal: 2000000,
      icon: <Medal size={24} className="text-gray-500" />,
      features: ['Hạn mức 1 - 2 triệu', 'Duyệt trong 24h'],
    },
    {
      id: 'bronze',
      name: 'ĐỒNG',
      code: 'DONG',
      min: '1.000.000 đ',
      max: '3.000.000 đ',
      limitVal: 3000000,
      icon: <Star size={24} className="text-orange-300" />,
      features: ['Hạn mức 1 - 3 triệu', 'Ưu tiên duyệt lệnh'],
    },
    {
      id: 'silver',
      name: 'BẠC',
      code: 'BAC',
      min: '1.000.000 đ',
      max: '4.000.000 đ',
      limitVal: 4000000,
      icon: <Star size={24} className="text-blue-200" />,
      features: ['Hạn mức 1 - 4 triệu', 'Hỗ trợ 24/7'],
    },
    {
      id: 'gold',
      name: 'VÀNG',
      code: 'VANG',
      min: '1.000.000 đ',
      max: '5.000.000 đ',
      limitVal: 5000000,
      icon: <Medal size={24} className="text-yellow-400" />,
      features: ['Hạn mức 1 - 5 triệu', 'Giảm 10% phí phạt'],
    },
    {
      id: 'diamond',
      name: 'KIM CƯƠNG',
      code: 'KIMCUONG',
      min: '1.000.000 đ',
      max: '10.000.000 đ',
      limitVal: 10000000,
      icon: <ShieldCheck size={24} className="text-blue-400" />,
      features: ['Hạn mức 1 - 10 triệu', 'Duyệt lệnh tức thì'],
    }
  ];

  const currentRankIndex = ranks.findIndex(r => r.id === (user?.rank || 'standard'));

  useEffect(() => {
    // Restore state if returning from PayOS or has pending PayOS upgrade
    if (user?.pendingUpgradeRank && view === RankView.LIST) {
      const pendingRank = ranks.find(r => r.id === user.pendingUpgradeRank);
      if (pendingRank) {
        setSelectedRank(pendingRank);
        setView(RankView.PAYMENT);
      }
    }
  }, [user?.pendingUpgradeRank]);

  const handleOpenPayment = (rank: any) => {
    setSelectedRank(rank);
    setView(RankView.LIST); // Need this for animation
    setTimeout(() => setView(RankView.PAYMENT), 50);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  const hasPending = !!user?.pendingUpgradeRank;

  if (view === RankView.PAYMENT && selectedRank) {
    const upgradePercent = Number(settings.UPGRADE_PERCENT) || 10;
    const fee = Math.round(selectedRank.limitVal * (upgradePercent / 100));
    
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500 overflow-hidden">
        <div className="w-full p-3 flex items-center justify-between bg-black text-white border-b border-white/5 flex-none">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView(RankView.LIST)}
              className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90"
            >
              <ChevronLeft size={16} />
            </button>
            <div>
              <h3 className="text-[9px] font-black uppercase tracking-widest leading-none">Phí nâng hạng {selectedRank.name}</h3>
              <p className="text-[6px] font-bold text-gray-500 uppercase mt-0.5 tracking-tighter">XÁC THỰC GIAO DỊCH NDV-SAFE</p>
            </div>
          </div>
          <button 
            onClick={() => setShowHelp(!showHelp)} 
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${showHelp ? 'bg-[#ff8c00] text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-400'}`}
          >
            <CircleHelp size={16} />
          </button>
        </div>

        <div className="flex-1 bg-black px-2 pt-1 pb-2 overflow-hidden flex flex-col">
          <div className="bg-[#111111] w-full rounded-2xl p-3 relative overflow-hidden shadow-2xl border border-white/10 flex-1 flex flex-col">
            <div className="flex-1 min-h-0 space-y-1.5 flex flex-col">
              {showHelp ? (
                <div className="h-full bg-[#ff8c00]/5 border border-[#ff8c00]/20 rounded-2xl p-5 animate-in fade-in zoom-in duration-300 space-y-5 overflow-y-auto">
                   <div className="flex items-center gap-3">
                      <Info size={18} className="text-[#ff8c00]" />
                      <span className="text-[14px] font-black text-[#ff8c00] uppercase tracking-widest">Hướng dẫn nâng hạng</span>
                   </div>
                   <div className="space-y-4">
                      {[
                        "Thanh toán: Hệ thống sử dụng PayOS để thanh toán tự động, an toàn và nhanh chóng.",
                        "Xác nhận: Sau khi thanh toán thành công, tài khoản của bạn sẽ được nâng hạng ngay lập tức.",
                        "Bảo mật: Mọi giao dịch đều được mã hóa và bảo vệ bởi hệ thống NDV-SAFE.",
                        "Hỗ trợ: Nếu gặp vấn đề trong quá trình thanh toán, vui lòng liên hệ bộ phận CSKH."
                      ].map((text, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-6 h-6 bg-[#ff8c00] rounded-full flex items-center justify-center shrink-0 font-black text-[12px] text-black">{idx + 1}</div>
                          <p className="text-[12px] font-bold text-gray-300 leading-relaxed">{text}</p>
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                      <div className="space-y-4 pb-4">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-3 bg-[#ff8c00] rounded-full"></div>
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Chi tiết nâng hạng</h4>
                          </div>
                        </div>

                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="bg-[#ff8c00]/5 border border-[#ff8c00]/20 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#ff8c00]/10 rounded-full flex items-center justify-center text-[#ff8c00]">
                                <ShieldCheck size={20} />
                              </div>
                              <div>
                                <h3 className="text-[12px] font-black text-white uppercase tracking-wider">Nâng hạng qua PayOS</h3>
                                <p className="text-[9px] font-bold text-[#ff8c00]/60 uppercase tracking-widest">Tự động • Nâng hạng ngay • Bảo mật</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                <div className="w-1.5 h-1.5 bg-[#ff8c00] rounded-full"></div>
                                <span>Tài khoản được nâng hạng ngay sau khi thanh toán thành công</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                <div className="w-1.5 h-1.5 bg-[#ff8c00] rounded-full"></div>
                                <span>Hệ thống tự động xử lý 24/7</span>
                              </div>
                            </div>

                            <div className="pt-2">
                              <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-500 uppercase">Phí nâng hạng</span>
                                <span className="text-[18px] font-black text-[#ff8c00]">{fee.toLocaleString()} đ</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 p-3 bg-black flex gap-2 z-[110] border-t border-white/5 mt-auto">
          <button
            onClick={() => onPayOSUpgrade(selectedRank.id, fee)}
            disabled={isSubmitting || isGlobalProcessing}
            className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95 bg-[#ff8c00] text-black shadow-orange-950/20`}
          >
            {isSubmitting || isGlobalProcessing ? 'ĐANG XỬ LÝ...' : 'NÂNG HẠNG TỰ ĐỘNG NGAY'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black px-4 flex flex-col animate-in fade-in duration-500 overflow-hidden">
      <div className="flex items-center justify-between px-1 py-4 flex-none">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="w-7 h-7 bg-[#111111] border border-white/5 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
          >
            <X size={14} />
          </button>
          <h2 className="text-base font-black text-white tracking-tighter uppercase">Hạng & Hạn mức</h2>
        </div>
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${showHelp ? 'bg-[#ff8c00] text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-500'}`}
        >
          <CircleHelp size={16} />
        </button>
      </div>

      {showHelp && (
        <div className="bg-[#ff8c00]/5 border border-[#ff8c00]/20 rounded-2xl p-5 mb-3 animate-in fade-in zoom-in duration-300 space-y-4 flex-none">
           <div className="flex items-center gap-3">
              <Info size={18} className="text-[#ff8c00]" />
              <span className="text-[14px] font-black text-[#ff8c00] uppercase tracking-widest">Quy định nâng hạng</span>
           </div>
           <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#ff8c00] rounded-full flex items-center justify-center shrink-0 font-black text-[12px] text-black">1</div>
                <p className="text-[12px] font-bold text-gray-300 leading-relaxed">Nâng hạng giúp tăng hạn mức vay tối đa, ưu tiên xét duyệt lệnh và nhận các đặc quyền riêng.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#ff8c00] rounded-full flex items-center justify-center shrink-0 font-black text-[12px] text-black">2</div>
                <p className="text-[12px] font-bold text-gray-300 leading-relaxed">Phí nâng hạng được tính cố định là {settings.UPGRADE_PERCENT}% dựa trên hạn mức tối đa của cấp bậc mục tiêu.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#ff8c00] rounded-full flex items-center justify-center shrink-0 font-black text-[12px] text-black">3</div>
                <p className="text-[12px] font-bold text-gray-300 leading-relaxed">Sau khi gửi yêu cầu, vui lòng đợi hệ thống kiểm tra và phê duyệt trong vòng 5-15 phút.</p>
              </div>
           </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-2 pb-4 overflow-hidden">
        {ranks.map((rank, idx) => {
          const isCurrent = user?.rank === rank.id;
          const isTargetPending = user?.pendingUpgradeRank === rank.id;
          const isHigherRank = idx > currentRankIndex;

          return (
            <div 
              key={rank.id}
              className={`flex-1 min-h-0 bg-[#111111] rounded-xl p-3 relative transition-all duration-300 border flex flex-col justify-center ${
                isCurrent ? 'border-[#ff8c00] shadow-[0_0_15px_rgba(255,140,0,0.1)]' : 'border-white/5'
              } ${!isCurrent && (currentRankIndex === ranks.length - 1 || hasPending) ? 'opacity-40' : 'opacity-100'}`}
            >
              {(isCurrent || isTargetPending) && (
                <div className={`absolute right-3 top-2 text-[6px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase ${
                  isCurrent ? 'bg-[#ff8c00] text-black' : 'bg-blue-500 text-white'
                }`}>
                  {isCurrent ? 'Hiện tại' : 'Đang duyệt'}
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                  {React.cloneElement(rank.icon as React.ReactElement, { size: 16 })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-sm font-black text-white leading-tight tracking-tight uppercase">{rank.name}</h3>
                    <span className="text-[7px] font-black text-[#ff8c00] tracking-widest">{rank.max}</span>
                  </div>
                  <div className="flex gap-2 mt-0.5">
                    {rank.features.slice(0, 2).map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-1">
                        <CheckCircle2 size={6} className={isCurrent ? 'text-[#ff8c00]' : 'text-gray-600'} />
                        <span className="text-[7px] font-bold text-gray-500 whitespace-nowrap">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {isHigherRank && !hasPending && (
                  <button 
                    onClick={() => handleOpenPayment(rank)}
                    className="bg-[#ff8c00] text-black font-black px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-orange-950/20 active:scale-95 transition-all text-[7px] uppercase tracking-widest"
                  >
                    <ArrowUpCircle size={10} />
                    NÂNG CẤP
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RankLimits;