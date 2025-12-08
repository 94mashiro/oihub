import TenantSelector from '@/components/biz/tenant-select';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useOneAPIClient } from '@/hooks/use-one-api-client';
import { useEffect, useState } from 'react';

interface UserInfo {
  id: number;
  username: string;
  display_name?: string;
  email?: string;
  role?: number;
  [key: string]: unknown;
}

const PopupMainScreen = () => {
  const navigate = useNavigate();
  const client = useOneAPIClient();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!client) {
        setUserInfo(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await client.get<UserInfo>('/api/user/self');
        setUserInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user info');
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [client]);

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <TenantSelector />

      {loading && (
        <div className="text-sm text-muted-foreground">Loading user info...</div>
      )}

      {error && (
        <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-md">
          Error: {error}
        </div>
      )}

      {userInfo && (
        <div className="flex flex-col gap-2 p-3 bg-muted rounded-md">
          <div className="text-sm font-medium">User Information</div>
          <div className="text-xs space-y-1">
            <div>
              <span className="text-muted-foreground">ID:</span> {userInfo.id}
            </div>
            <div>
              <span className="text-muted-foreground">Username:</span> {userInfo.username}
            </div>
            {userInfo.display_name && (
              <div>
                <span className="text-muted-foreground">Display Name:</span>{' '}
                {userInfo.display_name}
              </div>
            )}
            {userInfo.email && (
              <div>
                <span className="text-muted-foreground">Email:</span> {userInfo.email}
              </div>
            )}
            {userInfo.role !== undefined && (
              <div>
                <span className="text-muted-foreground">Role:</span> {userInfo.role}
              </div>
            )}
          </div>
        </div>
      )}

      <Button
        onClick={() => {
          navigate('/tenant/create');
        }}
      >
        Create Tenant
      </Button>
    </div>
  );
};

export default PopupMainScreen;
