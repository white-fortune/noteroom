import { useEffect, useRef } from "react";
import UnavilableContent from "../../assets/placeholders/unavailable_content.png";

export function ImageContainer({ noteImages, controller: [prevImage, nextImage, offset] }: any) {
    const carouselRef = useRef<HTMLDivElement>(null);

    const enlargeImage = (imageSrc: string, noteId: string, initialIndex: number) => {
        const modal = document.createElement("div");
        modal.classList.add("image-modal");
        let currentIndex = initialIndex;
        const isSmallScreen = window.innerWidth <= 768;

        modal.innerHTML = `
            <div class="image-modal-backdrop"></div>
            <div class="image-modal-content">
                <img src="${imageSrc}" class="enlarged-image" alt="Enlarged Note Image" />
                ${
                    !isSmallScreen
                        ? `
                    <button class="modal-carousel-control prev" aria-label="Previous Image">
                        <svg class="carousel-control-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="#1D1B20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="modal-carousel-control next" aria-label="Next Image">
                        <svg class="carousel-control-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 6L15 12L9 18" stroke="#1D1B20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>`
                        : ""
                }
                <div class="image-modal-page-number">
                    <svg class="page-number-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#1D1B20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 2V8H20" stroke="#1D1B20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="page-number-text">Page ${currentIndex + 1}/${noteImages.length}</span>
                </div>
                <div class="image-modal-top-controls">
                    <button class="image-modal-share" aria-label="Share Image">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 8L22 12M22 12L18 16M22 12H6M6 6L2 6M6 18L2 18" stroke="#1D1B20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="image-modal-download" aria-label="Download Image" data-noteid="${noteId}" data-imageindex="${initialIndex}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 16V4M12 16L8 12M12 16L16 12M20 20H4" stroke="#1D1B20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="image-modal-close" aria-label="Close Modal">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 6L18 18M6 18L18 6" stroke="#1D1B20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const imageElement = modal.querySelector(".enlarged-image") as HTMLImageElement;
        const shareButton = modal.querySelector(".image-modal-share") as HTMLButtonElement;
        const downloadButton = modal.querySelector(".image-modal-download") as HTMLButtonElement;
        const prevButton = modal.querySelector(".modal-carousel-control.prev") as HTMLButtonElement;
        const nextButton = modal.querySelector(".modal-carousel-control.next") as HTMLButtonElement;
        const closeButton = modal.querySelector(".image-modal-close") as HTMLButtonElement;
        const pageNumberText = modal.querySelector(".page-number-text") as HTMLSpanElement;

        const updateImage = (index: number) => {
            imageElement.src = noteImages[index] || UnavilableContent;
            downloadButton.setAttribute("data-imageindex", index.toString());
            pageNumberText.textContent = `Page ${index + 1}/${noteImages.length}`;
        };

        const downloadImage = async (src: string, index: number) => {
            try {
                const response = await fetch(src);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `note_${noteId}_image_${index + 1}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Download failed:", error);
                alert("Failed to download the image.");
            }
        };

        const shareImage = (src: string) => {
            const shareUrl = `${window.location.origin}/post/${noteId}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert("Link copied to clipboard!");
            }).catch((error) => {
                console.error("Failed to copy share link:", error);
                alert("Failed to copy the share link.");
            });
        };

        if (!isSmallScreen) {
            prevButton?.addEventListener("click", () => {
                currentIndex = (currentIndex - 1 + noteImages.length) % noteImages.length;
                updateImage(currentIndex);
            });
            nextButton?.addEventListener("click", () => {
                currentIndex = (currentIndex + 1) % noteImages.length;
                updateImage(currentIndex);
            });
        } else {
            let touchStartX = 0;
            let touchEndX = 0;
            const swipeThreshold = 50;

            imageElement.addEventListener("touchstart", (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });
            imageElement.addEventListener("touchend", (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const swipeDistance = touchEndX - touchStartX;
                if (Math.abs(swipeDistance) > swipeThreshold) {
                    if (swipeDistance > 0) {
                        currentIndex = (currentIndex - 1 + noteImages.length) % noteImages.length;
                    } else {
                        currentIndex = (currentIndex + 1) % noteImages.length;
                    }
                    updateImage(currentIndex);
                }
            });
        }

        shareButton.addEventListener("click", () => shareImage(imageElement.src));
        downloadButton.addEventListener("click", () => downloadImage(imageElement.src, currentIndex));
        closeButton.addEventListener("click", () => document.body.removeChild(modal));
        modal.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (target === modal || target.classList.contains("image-modal-backdrop")) {
                document.body.removeChild(modal);
            }
        });

        const keyHandler = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" && !isSmallScreen) {
                currentIndex = (currentIndex - 1 + noteImages.length) % noteImages.length;
                updateImage(currentIndex);
            } else if (e.key === "ArrowRight" && !isSmallScreen) {
                currentIndex = (currentIndex + 1) % noteImages.length;
                updateImage(currentIndex);
            } else if (e.key === "Escape") {
                document.body.removeChild(modal);
                document.removeEventListener("keydown", keyHandler);
            }
        };
        document.addEventListener("keydown", keyHandler);
    };

    useEffect(() => {
        if (window.innerWidth <= 768 && carouselRef.current) {
            let touchStartX = 0;
            let touchEndX = 0;
            const swipeThreshold = 50;

            const handleTouchStart = (e: TouchEvent) => {
                touchStartX = e.changedTouches[0].screenX;
            };

            const handleTouchEnd = (e: TouchEvent) => {
                touchEndX = e.changedTouches[0].screenX;
                const swipeDistance = touchEndX - touchStartX;
                if (Math.abs(swipeDistance) > swipeThreshold) {
                    if (swipeDistance > 0) {
                        prevImage();
                    } else {
                        nextImage();
                    }
                }
            };

            const carousel = carouselRef.current;
            carousel.addEventListener("touchstart", handleTouchStart);
            carousel.addEventListener("touchend", handleTouchEnd);

            return () => {
                carousel.removeEventListener("touchstart", handleTouchStart);
                carousel.removeEventListener("touchend", handleTouchEnd);
            };
        }
    }, [prevImage, nextImage]);

    return (
        <>
            {noteImages.length > 0 ? (
                <div className="carousel-container" id="note-image-container">
                    <div className="carousel-wrapper" ref={carouselRef} style={{ transform: `translateX(${-offset * 100}%)` }}>
                        {noteImages?.map((imageLink: string, index: number) => (
                            <div className="carousel-slide" key={index}>
                                <div className="carousel-content">
                                    <span className="note-page-number">{index + 1}</span>
                                    <img
                                        src={imageLink || UnavilableContent}
                                        className="image-links"
                                        onClick={() => enlargeImage(imageLink, "note-id-placeholder", index)} // Replace "note-id-placeholder" with actual note ID if available
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => prevImage()} data-tippy-content="Left Arrow (←)" className="carousel-control prev">
                        <svg className="carousel-control-icon" width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.6029 29.8333H67.332V38.1666H16.6029L39.9362 61.5L33.9987 67.3333L0.665367 34L33.9987 0.666649L39.9362 6.49998L16.6029 29.8333Z" fill="#1D1B20"/>
                        </svg>
                    </button>
                    <button onClick={() => nextImage()} data-tippy-content="Right Arrow (→)" className="carousel-control next">
                        <svg className="carousel-control-icon" width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M51.3971 38.1667H0.667969V29.8334H51.3971L28.0638 6.50002L34.0013 0.666687L67.3346 34L34.0013 67.3334L28.0638 61.5L51.3971 38.1667Z" fill="#1D1B20"/>
                        </svg>
                    </button>
                </div>
            ) : (
                ""
            )}
        </>
    );
}