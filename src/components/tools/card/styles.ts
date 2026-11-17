export const inputClass =
  "w-full min-h-[44px] rounded-xl bg-[#f5f5f7] px-3.5 py-2.5 text-base sm:text-sm text-zinc-950 placeholder:text-zinc-400 focus:bg-white focus:outline-2 focus:outline-[#4d7c0f]";
export const labelClass = "block text-xs font-semibold text-zinc-800 mb-1.5";
export const checkRowClass =
  "flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl bg-[#f5f5f7] px-3.5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-[#ebeced]";
export const toolBtnClass =
  "inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-[#f5f5f7] px-3 text-xs font-semibold text-zinc-800 transition hover:bg-[#ebeced] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40";
export const toggleBtnClass = (on: boolean) =>
  `inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl px-2.5 text-sm font-semibold transition cursor-pointer ${
    on ? "bg-[#4d7c0f] text-white" : "bg-[#f5f5f7] text-zinc-800 hover:bg-[#ebeced]"
  }`;
