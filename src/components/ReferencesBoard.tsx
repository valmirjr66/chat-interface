import { isMobile } from "react-device-detect";
import Skeleton from "react-loading-skeleton";
import webIcon from "../imgs/web-icon.svg";
import { Reference } from "../types";
import { useEffect, useRef, useState } from "react";
import httpCallers from "../service";
import useToaster from "../hooks/useToaster";
import { io, Socket } from "socket.io-client";

interface ReferencesBoardProps {
  showReferences: boolean;
  conversationId: string | null;
}

export default function ReferencesBoard({
  showReferences,
  conversationId,
}: ReferencesBoardProps) {
  const [references, setReferences] = useState<Reference[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { triggerToast } = useToaster({ type: "error" });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const { data } = await httpCallers.get(
          `assistant/conversations/${conversationId}/references`
        );

        setReferences(data.references);
      } catch {
        triggerToast();
        setReferences([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (conversationId) {
      setIsLoading(true);
      fetchReferences();
    } else {
      setReferences([]);
    }

    if (!socketRef.current) {
      socketRef.current = io(`${process.env.REACT_APP_WS_URL}`, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      });

      socketRef.current.on("referenceSnapshot", (references: Reference[]) => {
        console.log("chegou ref", references);
        setReferences(references);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [conversationId, triggerToast]);

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
          {isLoading ? (
            <Skeleton
              count={3}
              height={150}
              style={{ width: "100%", marginBottom: 32 }}
            />
          ) : (
            references.map((item) => {
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
                    <div className="previewCaption">{item.displayName}</div>
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
