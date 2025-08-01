import React, {
  forwardRef,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDarkStore } from "../../../stores/darkStore";
import { IconComponentProps } from "../../../types/components";
import { getCachedIcon, getNodeIcon } from "../../../utils/styleUtils";
import { cn } from "../../../utils/utils";

export const ForwardedIconComponent = memo(
  forwardRef(
    (
      {
        name,
        className,
        iconColor,
        stroke,
        strokeWidth,
        id = "",
        skipFallback = false,
        dataTestId = "",
      }: IconComponentProps,
      ref,
    ) => {
      // Subscribe to dark store directly in memoized component
      // This forces re-render when theme changes, bypassing memo
      const { dark: isDark } = useDarkStore();

      const [showFallback, setShowFallback] = useState(false);
      const [iconError, setIconError] = useState(false);
      const [TargetIcon, setTargetIcon] = useState<any>(getCachedIcon(name));

      useEffect(() => {
        setIconError(false);
        setTargetIcon(null);
        setShowFallback(false);

        let isMounted = true;
        let timer: NodeJS.Timeout | null = null;

        if (name && typeof name === "string") {
          getNodeIcon(name)
            .then((component) => {
              if (isMounted) {
                setTargetIcon(component);
                setShowFallback(false);
              }
            })
            .catch((error) => {
              if (isMounted) {
                console.error(`Error loading icon ${name}:`, error);
                setIconError(true);
                setShowFallback(false);
              }
            });

          // Show fallback skeleton if icon takes too long
          timer = setTimeout(() => {
            if (isMounted) setShowFallback(true);
          }, 30);
        }

        return () => {
          isMounted = false;
          if (timer) clearTimeout(timer);
        };
      }, [name]);

      const style = {
        strokeWidth: strokeWidth ?? 1.5,
        ...(stroke && { stroke: stroke }),
        ...(iconColor && { color: iconColor, stroke: stroke }),
      };

      // Handler for when the Suspense component throws
      const handleError = useCallback(() => {
        setIconError(true);
      }, []);

      if (!TargetIcon || iconError) {
        // Return a placeholder div or null depending on settings
        return skipFallback ? null : (
          <div
            className={cn(className, "flex items-center justify-center")}
            data-testid={
              dataTestId
                ? dataTestId
                : id
                  ? `${id}-placeholder`
                  : `icon-placeholder`
            }
          />
        );
      }

      const fallback = showFallback ? (
        <div className={cn(className, "flex items-center justify-center")}>
          <Skeleton className="h-4 w-4" />
        </div>
      ) : (
        <div className={className}></div>
      );

      // Prepare props for the icon component
      const iconProps = {
        className,
        style,
        ref,
        "data-testid": dataTestId
          ? dataTestId
          : id
            ? `${id}-${name}`
            : `icon-${name}`,
      };

      // Only pass isDark to custom icon components, not to standard SVG elements
      const isCustomIcon = TargetIcon?.$$typeof || TargetIcon?._payload || typeof TargetIcon === 'function';
      if (isCustomIcon) {
        iconProps.isDark = isDark;
      }

      return (
        <Suspense fallback={skipFallback ? undefined : fallback}>
          <ErrorBoundary onError={handleError}>
            {TargetIcon?.render || TargetIcon?._payload ? (
              <TargetIcon {...iconProps} />
            ) : (
              <div
                className={className}
                style={style}
                data-testid={
                  dataTestId
                    ? dataTestId
                    : id
                      ? `${id}-${name}`
                      : `icon-${name}`
                }
              >
                {TargetIcon}
              </div>
            )}
          </ErrorBoundary>
        </Suspense>
      );
    },
  ),
);

// Simple error boundary component for catching lazy load errors
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  onError: () => void;
}> {
  componentDidCatch(error: any) {
    this.props.onError();
  }

  render() {
    return this.props.children;
  }
}

export default ForwardedIconComponent;
