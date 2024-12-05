import { isMobile } from "react-device-detect";
import Skeleton from "react-loading-skeleton";
import webIcon from "../imgs/web-icon.svg";
import { Reference } from "../types";

interface ReferencesBoardProps {
  showReferences: boolean;
  isLoadingMessages: boolean;
  allReferences: Reference[];
}

export default function ReferencesBoard({
  showReferences,
  isLoadingMessages,
  allReferences,
}: ReferencesBoardProps) {
  return (
    <div
      className="referencesWrapper"
      style={{
        display: isMobile && !showReferences ? "none" : "flex",
        position: isMobile ? "fixed" : "relative",
        right: isMobile ? 100 : "unset",
        width: isMobile ? "unset" : "25%",
        height: isMobile ? "70vh" : "60vh",
      }}
    >
      <div className="referencesHeader">References</div>
      <div className="referencesBoard">
        <div
          style={{
            height: "100%",
            paddingTop: 20,
            width: "100%",
          }}
        >
          {isLoadingMessages ? (
            <Skeleton
              count={3}
              height={150}
              style={{ width: "100%", marginBottom: 32 }}
            />
          ) : (
            allReferences.map((item) => {
              return (
                <a
                  href={item.downloadURL}
                  className="referenceCard"
                  target="_blank"
                  key={item.fileId}
                  rel="noreferrer"
                >
                  <img src={webIcon} alt="Reference link" width={20} />
                  <div className="referenceCardContent">
                    <caption className="previewCaption">
                      {item.displayName}
                    </caption>
                    <img
                      src={item.previewImageURL}
                      width="100%"
                      alt={`Preview of ${item.displayName}`}
                      className="previewImage"
                    />
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
