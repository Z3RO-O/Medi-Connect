import { useEffect, useRef, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Monitor, Phone, Video, VideoOff } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMobile } from "@/hooks/use-mobile"

export default function MeetingPage() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const meetingId = params.id as string
  const userName = searchParams.get("name") || "Guest"

  const isMobile = useMobile()
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [participants, setParticipants] = useState([
    { id: "1", name: userName, isLocal: true },
    { id: "2", name: "Sarah Johnson", isLocal: false },
    { id: "3", name: "Michael Chen", isLocal: false },
  ])

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let mediaStream: MediaStream | null = null

    const setupMedia = async () => {
      try {
        // First try to get just audio if video is off
        if (!isVideoOn) {
          if (isMicOn) {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          }
          return
        }

        // Try to get both video and audio
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: isMicOn,
          })
        } catch (videoErr) {
          console.warn("Could not access camera:", videoErr)
          // If video fails, fall back to audio only
          setIsVideoOn(false)
          if (isMicOn) {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          }
        }
      } catch (err) {
        console.error("Error accessing media devices:", err)
        setErrorMessage("Could not access your camera or microphone. Please check your device permissions.")
        setIsVideoOn(false)
        if (isMicOn) {
          setIsMicOn(false)
        }
      }

      // Apply the stream to the video element if we got one
      if (mediaStream && localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream
      }
    }

    setupMedia()

    return () => {
      // Clean up media streams when component unmounts
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isVideoOn, isMicOn])

  const toggleMic = () => setIsMicOn(!isMicOn)

  const toggleVideo = async () => {
    if (!isVideoOn) {
      // When turning video on, check if we can access the camera first
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
        setIsVideoOn(true)
      } catch (err) {
        console.error("Could not access camera:", err)
        alert("Could not access your camera. Please check your device permissions.")
      }
    } else {
      // Just turn off video if it's currently on
      setIsVideoOn(false)
    }
  }

  const endCall = () => {
    // In a real app, you would disconnect from the WebRTC service here
    window.location.href = "/"
  }

  const shareScreen = () => {
    // In a real app, you would implement screen sharing here
    alert("Screen sharing would be implemented here")
  }

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meeting/${meetingId}`
    navigator.clipboard.writeText(link)
    alert("Meeting link copied to clipboard")
  }

  return (
    <div className="flex h-screen flex-col bg-slate-900">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-emerald-500" />
          <span className="font-medium text-white">Meeting: {meetingId}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={copyMeetingLink}
          className="text-white hover:bg-slate-800 hover:text-white"
        >
          Copy Invite Link
        </Button>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">
        {errorMessage && (
          <div className="bg-red-500 p-2 text-center text-white">
            {errorMessage}
            <Button variant="link" className="ml-2 text-white underline" onClick={() => setErrorMessage(null)}>
              Dismiss
            </Button>
          </div>
        )}
        <div className="flex flex-1 flex-wrap content-center items-center justify-center gap-4 overflow-auto p-4">
          {participants.map((participant) => (
            <Card
              key={participant.id}
              className={`relative overflow-hidden ${
                participants.length <= 2 ? "h-[60vh] w-[80%]" : isMobile ? "h-[30vh] w-full" : "h-[40vh] w-[45%]"
              } bg-slate-800`}
            >
              {participant.isLocal ? (
                isVideoOn ? (
                  <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-slate-700">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-3xl">{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                )
              ) : (
                <div className="grid h-full w-full place-items-center bg-slate-700">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-3xl">{participant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              )}

              <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-sm text-white">
                {participant.name} {participant.isLocal && "(You)"}
                {!participant.isLocal && !isMicOn && <MicOff className="ml-1 inline h-3 w-3" />}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-2 bg-slate-950 p-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMic}
                  className={`rounded-full ${!isMicOn ? "bg-red-500 text-white hover:bg-red-600" : "bg-slate-800 text-white hover:bg-slate-700"}`}
                >
                  {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isMicOn ? "Turn off microphone" : "Turn on microphone"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleVideo}
                  className={`rounded-full ${!isVideoOn ? "bg-red-500 text-white hover:bg-red-600" : "bg-slate-800 text-white hover:bg-slate-700"}`}
                >
                  {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isVideoOn ? "Turn off camera" : "Turn on camera"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareScreen}
                  className="rounded-full bg-slate-800 text-white hover:bg-slate-700"
                >
                  <Monitor className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share your screen</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={endCall}
                  className="rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <Phone className="h-5 w-5 rotate-[135deg]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>End call</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </main>
    </div>
  )
}
