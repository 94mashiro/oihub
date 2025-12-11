import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from '@/components/ui/frame';

const PopupSettingsScreen = () => {
  const navigate = useNavigate();

  return (
    <Frame>
      <FrameHeader className="relative p-2">
        <div className="absolute top-2.5 left-2">
          <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
        </div>
        <div className="pl-10">
          <FrameTitle>设置</FrameTitle>
          <FrameDescription className="mt-0.5 text-xs">配置扩展选项</FrameDescription>
        </div>
      </FrameHeader>
      <FramePanel className="p-3">
        <p className="text-muted-foreground text-sm">暂无设置项</p>
      </FramePanel>
    </Frame>
  );
};

export default PopupSettingsScreen;
