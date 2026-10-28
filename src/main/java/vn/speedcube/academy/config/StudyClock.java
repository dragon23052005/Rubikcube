package vn.speedcube.academy.config;
import org.springframework.context.annotation.*;
@Configuration
public class StudyClock {@Bean java.time.Clock reviewClock(){return java.time.Clock.systemUTC();}}
