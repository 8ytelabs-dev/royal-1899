import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Shield, UserRound, Users } from 'lucide-react';
import {
  createAdminAccount,
  fetchAdminAccounts,
  type AdminAccount,
} from '../../services/cmsApi';

const inputClass =
  'w-full px-3.5 py-2.5 text-sm bg-[#140c07] border border-[#ece2cc]/14 hover:border-[#ece2cc]/25 focus:border-[#dcb975] rounded-md text-[#ece2cc] placeholder:text-[#c2b398]/45 focus:outline-none transition-colors';

export function AdminAccountsPanel() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminAccount['role']>('member');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchAdminAccounts()
      .then((result) => {
        if (!cancelled) {
          setAccounts(result);
          setLoading(false);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'ანგარიშების ჩატვირთვა ვერ მოხერხდა');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const account = await createAdminAccount({ email, password, role });
      setAccounts((current) =>
        [...current, account].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      );
      setEmail('');
      setPassword('');
      setRole('member');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ანგარიშის შექმნა ვერ მოხერხდა');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="font-display text-xl font-semibold text-[#ece2cc]">
          ანგარიშების მართვა
        </h2>
        <p className="text-sm text-[#c2b398]">
          შექმენით ადმინისტრატორის ან მომხმარებლის ანგარიში ელფოსტითა და პაროლით.
        </p>
      </header>

      <section className="bg-[#22150d] border border-[#ece2cc]/10 rounded-lg p-6 lg:p-7 space-y-5">
        <div className="pb-3.5 border-b border-[#ece2cc]/8">
          <h3 className="font-display text-lg font-semibold text-[#ece2cc]">
            ახალი ანგარიშის შექმნა
          </h3>
          <p className="text-xs text-[#c2b398] mt-0.5">
            პაროლი მინიმუმ 10 სიმბოლოს უნდა შეიცავდეს და მონაცემთა ბაზაში მხოლოდ ჰეშირებული სახით ინახება.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="account-email" className="block text-xs font-medium text-[#dcb975] mb-1.5">
              ელფოსტა
            </label>
            <input
              id="account-email"
              type="email"
              autoComplete="email"
              required
              maxLength={255}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="account-password" className="block text-xs font-medium text-[#dcb975] mb-1.5">
              საწყისი პაროლი
            </label>
            <input
              id="account-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              maxLength={256}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="account-role" className="block text-xs font-medium text-[#dcb975] mb-1.5">
              ანგარიშის ტიპი
            </label>
            <select
              id="account-role"
              value={role}
              onChange={(event) => {
                if (event.target.value === 'admin' || event.target.value === 'member') {
                  setRole(event.target.value);
                }
              }}
              className={inputClass}
            >
              <option value="member">მომხმარებელი</option>
              <option value="admin">ადმინისტრატორი</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] rounded-md transition-colors disabled:opacity-60 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              {saving ? 'იქმნება…' : 'ანგარიშის შექმნა'}
            </button>
          </div>
        </form>

        {error && (
          <p role="alert" className="text-sm text-red-300">
            {error}
          </p>
        )}
      </section>

      <section className="bg-[#22150d] border border-[#ece2cc]/10 rounded-lg p-6 lg:p-7 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#dcb975]" aria-hidden="true" />
          <h3 className="font-display text-lg font-semibold text-[#ece2cc]">
            შექმნილი ანგარიშები
          </h3>
          <span className="font-mono text-xs text-[#c2b398]">({accounts.length})</span>
        </div>

        {loading ? (
          <p className="text-sm text-[#c2b398]">იტვირთება…</p>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-[#c2b398]">ანგარიშები ჯერ არ შექმნილა.</p>
        ) : (
          <ul className="divide-y divide-[#ece2cc]/10">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <span className="text-sm text-[#ece2cc]">{account.email}</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#c2b398]">
                  {account.role === 'admin' ? (
                    <Shield className="w-3.5 h-3.5 text-[#dcb975]" aria-hidden="true" />
                  ) : (
                    <UserRound className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {account.role === 'admin' ? 'ადმინისტრატორი' : 'მომხმარებელი'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
