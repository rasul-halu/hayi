import { BookOpen } from "lucide-react";
import ReferenceDictionary from "../../components/dictionary/ReferenceDictionary";
import BottomNav from "../../components/layout/BottomNav";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";

export default function Vocabulary() {
  return (
    <PageContainer
      style={{
        background: "#F4F7F2",
        color: "#2D2D2D"
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 18,
          background: "#E9F8DD",
          color: "#58CC02",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 5px 0 #CFE2C4",
          marginBottom: 14
        }}
      >
        <AppIcon icon={BookOpen} size={30} />
      </div>

      <SectionTitle title="Словарь" />
      <ReferenceDictionary />
      <BottomNav />
    </PageContainer>
  );
}
