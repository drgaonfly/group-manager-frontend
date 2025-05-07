import { useTranslation } from "react-i18next";
import { useUser } from "../lib/auth";
import { useMemo } from "react";
import { User } from "../lib/api"; // 导入User接口
import Pagination from "../components/Pagination"; // 导入Pagination组件

function TeamIncome() {
  const { t } = useTranslation();

  // 用户信息查询
  const { data: user } = useUser();

  // 计算团队总收益
  const totalTeamIncome = useMemo(() => {
    if (!user?.teamBenefits || user.teamBenefits.length === 0) {
      return 0;
    }

    // 累加所有的 usdtIncome
    return user.teamBenefits
      .reduce((total, benefit) => {
        return total + (benefit.usdtIncome || 0);
      }, 0)
      .toFixed(2);
  }, [user?.teamBenefits]);

  // 计算团队成员数量 - 递归计算所有子成员
  const memberCount = useMemo(() => {
    if (!user?.depthCustomers) return 0;

    // 递归计算所有层级的成员数量
    const countAllMembers = (members: User[]): number => {
      if (!members || members.length === 0) return 0;

      let count = members.length;

      // 递归计算每个成员的子成员
      for (const member of members) {
        if (member.children && member.children.length > 0) {
          count += countAllMembers(member.children as User[]);
        }
      }

      return count;
    };

    return countAllMembers(user.depthCustomers);
  }, [user?.depthCustomers]);

  return (
    <div className="min-h-screen bg-[#1a1b1e]">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 bg-[#1a1b1e] z-10">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => window.history.back()} className="text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-white ml-4">{t("team.myTeam")}</span>
        </div>
      </div>

      {/* 收入统计卡片 */}
      <div className="pt-16 px-4">
        <div className="bg-[#25262B] rounded-lg p-6">
          <div className="flex justify-between mb-2">
            <div className="text-center">
              <div className="text-gray-400 mb-2">USDT</div>
              <div className="text-white text-xl mb-2">{totalTeamIncome}</div>
              <div className="text-gray-400 text-sm">
                {t("team.totalIncome")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 mb-2">{t("team.memberCount")}</div>
              <div className="text-white text-xl mb-2">{memberCount}</div>
              <div className="text-gray-400 text-sm">
                {t("team.memberCount")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 团队收益记录 - 显示全部记录 */}
      <div className="px-4 mt-6">
        <div className="bg-[#25262B] rounded-lg p-6">
          <div className="text-white text-lg mb-4">
            {t("users.incomeDetails")}
          </div>

          {user?.teamBenefits && user.teamBenefits.length > 0 ? (
            <Pagination
              items={user.teamBenefits.sort(
                (a, b) =>
                  new Date(b.earningTime).getTime() -
                  new Date(a.earningTime).getTime(),
              )}
              itemsPerPage={5}
              newestFirst={false} // 已经在items中排序了，所以这里设为false
              renderItem={(customer) => (
                <div
                  key={customer._id}
                  className="bg-gray-800 rounded-xl p-4 shadow-md mb-3"
                >
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div>
                      <div className="text-gray-400 text-xs">ETH</div>
                      <div className="text-sm font-semibold text-yellow-400">
                        {customer.ethIncome}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs ml-4">USDT</div>
                      <div className="text-sm font-semibold text-yellow-400">
                        ≈ {customer.usdtIncome}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">
                        {t("home.address")}
                      </div>
                      <div className="text-sm text-white truncate">
                        {customer.fromAddress}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        <div className="text-gray-400 text-xs">
                          {t("users.date")}
                        </div>
                        {new Date(customer.earningTime).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              emptyMessage={
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <img
                    src="/nors-BR_U97rM.png"
                    alt={t("miningpool.noDataAlt")}
                    className="w-24 h-24 mb-4 object-contain"
                  />
                  <span>{t("miningpool.noData")}</span>
                </div>
              }
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <img
                src="/nors-BR_U97rM.png"
                alt={t("miningpool.noDataAlt")}
                className="w-24 h-24 mb-4 object-contain"
              />
              <span>{t("miningpool.noData")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamIncome;
